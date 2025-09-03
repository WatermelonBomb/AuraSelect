from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...crud import trial_request as crud_trial_request, product as crud_product
from ...models.trial_request import TrialStatus
from ...schemas.trial_request import (
    TrialRequestCreate, TrialRequestUpdate, TrialRequestStaffUpdate,
    TrialRequestResponse, TrialRequestListItem, TrialRequestStatusUpdate,
    TrialRequestFeedback, TrialRequestFilter, TrialRequestWithDetails
)
from ...schemas.common import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[TrialRequestListItem])
async def get_trial_requests(
    page: int = Query(1, ge=1, description="ページ番号"),
    size: int = Query(20, ge=1, le=100, description="ページサイズ"),
    status: Optional[TrialStatus] = Query(None, description="ステータスフィルタ"),
    product_id: Optional[int] = Query(None, description="商品IDフィルタ"),
    customer_id: Optional[int] = Query(None, description="顧客IDフィルタ"),
    has_feedback: Optional[bool] = Query(None, description="フィードバック有無"),
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエスト一覧を取得"""
    skip = (page - 1) * size
    
    filters = TrialRequestFilter(
        status=status,
        product_id=product_id,
        customer_id=customer_id,
        has_feedback=has_feedback
    )
    
    trial_requests = await crud_trial_request.get_filtered_requests(
        db, filters=filters, skip=skip, limit=size
    )
    total = await crud_trial_request.get_count(db)
    
    return PaginatedResponse[TrialRequestListItem](
        items=[TrialRequestListItem.model_validate(request) for request in trial_requests],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/pending", response_model=PaginatedResponse[TrialRequestListItem])
async def get_pending_requests(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """承認待ちのトライアルリクエスト一覧を取得"""
    skip = (page - 1) * size
    requests = await crud_trial_request.get_pending_requests(db, skip=skip, limit=size)
    total = len(requests)
    
    return PaginatedResponse[TrialRequestListItem](
        items=[TrialRequestListItem.model_validate(request) for request in requests],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/stats")
async def get_trial_stats(
    start_date: Optional[str] = Query(None, description="開始日 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="終了日 (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエスト統計を取得"""
    from sqlalchemy import select, func
    from ...models.trial_request import TrialStatus
    
    # 基本統計
    total_result = await db.execute(select(func.count(crud_trial_request.model.id)))
    total_requests = total_result.scalar() or 0
    
    # ステータス別統計
    status_stats = {}
    for status in TrialStatus:
        result = await db.execute(
            select(func.count(crud_trial_request.model.id))
            .where(crud_trial_request.model.status == status)
        )
        status_stats[status.value] = result.scalar() or 0
    
    # 最近の統計（過去30日）
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_result = await db.execute(
        select(func.count(crud_trial_request.model.id))
        .where(crud_trial_request.model.created_at >= thirty_days_ago)
    )
    recent_requests = recent_result.scalar() or 0
    
    return {
        "total_requests": total_requests,
        "status_breakdown": status_stats,
        "recent_requests": recent_requests,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }


@router.get("/active", response_model=PaginatedResponse[TrialRequestListItem])
async def get_active_requests(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """アクティブなトライアルリクエスト一覧を取得"""
    skip = (page - 1) * size
    requests = await crud_trial_request.get_active_requests(db, skip=skip, limit=size)
    total = len(requests)
    
    return PaginatedResponse[TrialRequestListItem](
        items=[TrialRequestListItem.model_validate(request) for request in requests],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/stats")
async def get_trial_stats(
    start_date: Optional[str] = Query(None, description="開始日 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="終了日 (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエスト統計を取得"""
    from sqlalchemy import select, func
    from ...models.trial_request import TrialStatus
    
    # 基本統計
    total_result = await db.execute(select(func.count(crud_trial_request.model.id)))
    total_requests = total_result.scalar() or 0
    
    # ステータス別統計
    status_stats = {}
    for status in TrialStatus:
        result = await db.execute(
            select(func.count(crud_trial_request.model.id))
            .where(crud_trial_request.model.status == status)
        )
        status_stats[status.value] = result.scalar() or 0
    
    # 最近の統計（過去30日）
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_result = await db.execute(
        select(func.count(crud_trial_request.model.id))
        .where(crud_trial_request.model.created_at >= thirty_days_ago)
    )
    recent_requests = recent_result.scalar() or 0
    
    return {
        "total_requests": total_requests,
        "status_breakdown": status_stats,
        "recent_requests": recent_requests,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }


@router.get("/feedback-needed", response_model=PaginatedResponse[TrialRequestListItem])
async def get_requests_needing_feedback(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """フィードバック待ちのトライアルリクエスト一覧を取得"""
    skip = (page - 1) * size
    requests = await crud_trial_request.get_completed_without_feedback(
        db, skip=skip, limit=size
    )
    total = len(requests)
    
    return PaginatedResponse[TrialRequestListItem](
        items=[TrialRequestListItem.model_validate(request) for request in requests],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/stats")
async def get_trial_stats(
    start_date: Optional[str] = Query(None, description="開始日 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="終了日 (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエスト統計を取得"""
    from sqlalchemy import select, func
    from ...models.trial_request import TrialStatus
    
    # 基本統計
    total_result = await db.execute(select(func.count(crud_trial_request.model.id)))
    total_requests = total_result.scalar() or 0
    
    # ステータス別統計
    status_stats = {}
    for status in TrialStatus:
        result = await db.execute(
            select(func.count(crud_trial_request.model.id))
            .where(crud_trial_request.model.status == status)
        )
        status_stats[status.value] = result.scalar() or 0
    
    # 最近の統計（過去30日）
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_result = await db.execute(
        select(func.count(crud_trial_request.model.id))
        .where(crud_trial_request.model.created_at >= thirty_days_ago)
    )
    recent_requests = recent_result.scalar() or 0
    
    return {
        "total_requests": total_requests,
        "status_breakdown": status_stats,
        "recent_requests": recent_requests,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }


@router.get("/{request_id}", response_model=TrialRequestResponse)
async def get_trial_request(
    request_id: int,
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエスト詳細を取得"""
    trial_request = await crud_trial_request.get(db, id=request_id)
    if not trial_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    return TrialRequestResponse.model_validate(trial_request)


@router.post("/", response_model=TrialRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_trial_request(
    request_in: TrialRequestCreate,
    customer_id: int = Query(1, description="顧客ID"),  # TODO: 認証から取得
    db: AsyncSession = Depends(get_db)
):
    """新しいトライアルリクエストを作成"""
    # 商品存在確認と価格取得
    product = await crud_product.get(db, id=request_in.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された商品が見つかりません"
        )
    
    if not product.is_trial_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="この商品はトライアル対象外です"
        )
    
    # トライアル価格を取得（設定されていなければ通常価格）
    unit_price = product.trial_price if product.trial_price else product.price
    
    trial_request = await crud_trial_request.create_request(
        db, obj_in=request_in, customer_id=customer_id, unit_price=float(unit_price)
    )
    
    return TrialRequestResponse.model_validate(trial_request)


@router.put("/{request_id}", response_model=TrialRequestResponse)
async def update_trial_request(
    request_id: int,
    request_in: TrialRequestUpdate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_user)
):
    """トライアルリクエストを更新（顧客用）"""
    trial_request = await crud_trial_request.get(db, id=request_id)
    if not trial_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    
    # 編集可能なステータスかチェック
    if trial_request.status not in [TrialStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このステータスでは編集できません"
        )
    
    updated_request = await crud_trial_request.update(
        db, db_obj=trial_request, obj_in=request_in
    )
    return TrialRequestResponse.model_validate(updated_request)


@router.patch("/{request_id}/status", response_model=TrialRequestResponse)
async def update_request_status(
    request_id: int,
    status_update: TrialRequestStatusUpdate,
    staff_id: int = Query(..., description="スタッフID"),  # TODO: 認証から取得
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエストステータスを更新（スタッフ用）"""
    trial_request = await crud_trial_request.get(db, id=request_id)
    if not trial_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    
    # ステータスに応じた処理
    if status_update.status == TrialStatus.APPROVED:
        updated_request = await crud_trial_request.approve_request(
            db, request_id=request_id, approved_by=staff_id
        )
    elif status_update.status == TrialStatus.IN_PROGRESS:
        updated_request = await crud_trial_request.start_trial(
            db, request_id=request_id, processed_by=staff_id
        )
    elif status_update.status == TrialStatus.COMPLETED:
        updated_request = await crud_trial_request.complete_trial(
            db, request_id=request_id
        )
    else:
        updated_request = await crud_trial_request.change_status(
            db, request_id=request_id, status=status_update.status,
            staff_notes=status_update.staff_notes
        )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ステータス更新に失敗しました"
        )
    
    return TrialRequestResponse.model_validate(updated_request)


@router.post("/{request_id}/feedback", response_model=TrialRequestResponse)
async def add_trial_feedback(
    request_id: int,
    feedback: TrialRequestFeedback,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_user)
):
    """トライアルにフィードバックを追加"""
    trial_request = await crud_trial_request.add_feedback(
        db,
        request_id=request_id,
        rating=feedback.customer_rating,
        effectiveness_rating=feedback.effectiveness_rating,
        review=feedback.customer_review,
        purchase_intent=feedback.purchase_intent
    )
    
    if not trial_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つからないか、フィードバック追加できません"
        )
    
    return TrialRequestResponse.model_validate(trial_request)


@router.patch("/{request_id}/staff-update", response_model=TrialRequestResponse)
async def staff_update_request(
    request_id: int,
    staff_update: TrialRequestStaffUpdate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_staff_user)
):
    """スタッフによるトライアルリクエスト更新"""
    trial_request = await crud_trial_request.get(db, id=request_id)
    if not trial_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    
    updated_request = await crud_trial_request.update(
        db, db_obj=trial_request, obj_in=staff_update
    )
    return TrialRequestResponse.model_validate(updated_request)


# 顧客別・商品別のエンドポイント
@router.get("/customer/{customer_id}", response_model=PaginatedResponse[TrialRequestListItem])
async def get_customer_requests(
    customer_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """特定顧客のトライアルリクエスト一覧"""
    skip = (page - 1) * size
    requests = await crud_trial_request.get_by_customer(
        db, customer_id=customer_id, skip=skip, limit=size
    )
    total = len(requests)
    
    return PaginatedResponse[TrialRequestListItem](
        items=[TrialRequestListItem.model_validate(request) for request in requests],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/stats")
async def get_trial_stats(
    start_date: Optional[str] = Query(None, description="開始日 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="終了日 (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエスト統計を取得"""
    from sqlalchemy import select, func
    from ...models.trial_request import TrialStatus
    
    # 基本統計
    total_result = await db.execute(select(func.count(crud_trial_request.model.id)))
    total_requests = total_result.scalar() or 0
    
    # ステータス別統計
    status_stats = {}
    for status in TrialStatus:
        result = await db.execute(
            select(func.count(crud_trial_request.model.id))
            .where(crud_trial_request.model.status == status)
        )
        status_stats[status.value] = result.scalar() or 0
    
    # 最近の統計（過去30日）
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_result = await db.execute(
        select(func.count(crud_trial_request.model.id))
        .where(crud_trial_request.model.created_at >= thirty_days_ago)
    )
    recent_requests = recent_result.scalar() or 0
    
    return {
        "total_requests": total_requests,
        "status_breakdown": status_stats,
        "recent_requests": recent_requests,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }


@router.get("/product/{product_id}", response_model=PaginatedResponse[TrialRequestListItem])
async def get_product_requests(
    product_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """特定商品のトライアルリクエスト一覧"""
    skip = (page - 1) * size
    requests = await crud_trial_request.get_by_product(
        db, product_id=product_id, skip=skip, limit=size
    )
    total = len(requests)
    
    return PaginatedResponse[TrialRequestListItem](
        items=[TrialRequestListItem.model_validate(request) for request in requests],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


# 便利なアクション用エンドポイント
@router.patch("/{request_id}/approve", response_model=TrialRequestResponse)
async def approve_trial_request(
    request_id: int,
    request_body: dict = {},
    staff_id: int = Query(1, description="スタッフID"),  # TODO: 認証から取得
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエストを承認"""
    staff_notes = request_body.get("staff_notes")
    
    updated_request = await crud_trial_request.approve_request(
        db, request_id=request_id, approved_by=staff_id
    )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    
    if staff_notes:
        updated_request = await crud_trial_request.update(
            db, db_obj=updated_request, obj_in={"staff_notes": staff_notes}
        )
    
    return TrialRequestResponse.model_validate(updated_request)


@router.patch("/{request_id}/reject", response_model=TrialRequestResponse)
async def reject_trial_request(
    request_id: int,
    request_body: dict = {},
    staff_id: int = Query(1, description="スタッフID"),  # TODO: 認証から取得
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエストを拒否"""
    from ...models.trial_request import TrialStatus
    staff_notes = request_body.get("staff_notes")
    
    updated_request = await crud_trial_request.change_status(
        db, request_id=request_id, status=TrialStatus.REJECTED, staff_notes=staff_notes
    )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    
    return TrialRequestResponse.model_validate(updated_request)


@router.patch("/{request_id}/complete", response_model=TrialRequestResponse)
async def complete_trial_request(
    request_id: int,
    request_body: dict = {},
    staff_id: int = Query(1, description="スタッフID"),  # TODO: 認証から取得
    db: AsyncSession = Depends(get_db)
):
    """トライアルリクエストを完了"""
    from ...models.trial_request import TrialStatus
    from datetime import datetime
    
    staff_notes = request_body.get("staff_notes")
    
    # トライアルリクエストを取得
    trial_request = await crud_trial_request.get(db, id=request_id)
    if not trial_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トライアルリクエストが見つかりません"
        )
    
    # APPROVED または IN_PROGRESS の場合のみ完了可能
    if trial_request.status not in [TrialStatus.APPROVED, TrialStatus.IN_PROGRESS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このステータスではトライアルを完了できません"
        )
    
    # ステータスを完了に変更
    trial_request.status = TrialStatus.COMPLETED
    trial_request.completion_date = datetime.utcnow()
    
    # スタッフノートが提供された場合は更新
    if staff_notes:
        trial_request.staff_notes = staff_notes
    
    db.add(trial_request)
    await db.commit()
    await db.refresh(trial_request)
    
    return TrialRequestResponse.model_validate(trial_request)