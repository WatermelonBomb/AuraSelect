from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .base import CRUDBase
from ..models.trial_request import TrialRequest, TrialStatus
from ..schemas.trial_request import TrialRequestCreate, TrialRequestUpdate, TrialRequestFilter


class CRUDTrialRequest(CRUDBase[TrialRequest, TrialRequestCreate, TrialRequestUpdate]):
    """トライアルリクエストCRUD操作"""
    
    async def get_by_customer(
        self,
        db: AsyncSession,
        *,
        customer_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """顧客のトライアルリクエスト一覧を取得"""
        result = await db.execute(
            select(TrialRequest)
            .where(TrialRequest.customer_id == customer_id)
            .order_by(TrialRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_product(
        self,
        db: AsyncSession,
        *,
        product_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """商品のトライアルリクエスト一覧を取得"""
        result = await db.execute(
            select(TrialRequest)
            .where(TrialRequest.product_id == product_id)
            .order_by(TrialRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_status(
        self,
        db: AsyncSession,
        *,
        status: TrialStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """ステータス別トライアルリクエスト一覧を取得"""
        result = await db.execute(
            select(TrialRequest)
            .where(TrialRequest.status == status)
            .order_by(TrialRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_pending_requests(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """承認待ちのリクエスト一覧を取得"""
        return await self.get_by_status(db, status=TrialStatus.PENDING, skip=skip, limit=limit)
    
    async def get_active_requests(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """アクティブなリクエスト一覧を取得"""
        result = await db.execute(
            select(TrialRequest)
            .where(TrialRequest.status.in_([
                TrialStatus.PENDING, 
                TrialStatus.APPROVED, 
                TrialStatus.IN_PROGRESS
            ]))
            .order_by(TrialRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_completed_without_feedback(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """完了済みだがフィードバック未入力のリクエスト一覧"""
        result = await db.execute(
            select(TrialRequest)
            .where(TrialRequest.status == TrialStatus.COMPLETED)
            .where(TrialRequest.customer_rating.is_(None))
            .order_by(TrialRequest.completion_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_filtered_requests(
        self,
        db: AsyncSession,
        *,
        filters: TrialRequestFilter,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrialRequest]:
        """フィルタリングされたリクエスト一覧を取得"""
        query = select(TrialRequest)
        conditions = []
        
        if filters.status:
            conditions.append(TrialRequest.status == filters.status)
        
        if filters.product_id:
            conditions.append(TrialRequest.product_id == filters.product_id)
        
        if filters.customer_id:
            conditions.append(TrialRequest.customer_id == filters.customer_id)
        
        if filters.date_from:
            conditions.append(TrialRequest.created_at >= filters.date_from)
        
        if filters.date_to:
            conditions.append(TrialRequest.created_at <= filters.date_to)
        
        if filters.has_feedback is not None:
            if filters.has_feedback:
                conditions.append(TrialRequest.customer_rating.is_not(None))
            else:
                conditions.append(TrialRequest.customer_rating.is_(None))
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(TrialRequest.created_at.desc())
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())
    
    async def create_request(
        self,
        db: AsyncSession,
        *,
        obj_in: TrialRequestCreate,
        customer_id: int,
        unit_price: float
    ) -> TrialRequest:
        """トライアルリクエストを作成"""
        total_price = unit_price * obj_in.quantity
        
        db_obj = TrialRequest(
            customer_id=customer_id,
            product_id=obj_in.product_id,
            quantity=obj_in.quantity,
            trial_duration_days=obj_in.trial_duration_days,
            unit_price=unit_price,
            total_price=total_price,
            reason=obj_in.reason,
            customer_notes=obj_in.customer_notes,
            preferred_start_date=obj_in.preferred_start_date,
            status=TrialStatus.PENDING
        )
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def approve_request(
        self,
        db: AsyncSession,
        *,
        request_id: int,
        approved_by: int
    ) -> Optional[TrialRequest]:
        """リクエストを承認"""
        trial_request = await self.get(db, id=request_id)
        if not trial_request or trial_request.status != TrialStatus.PENDING:
            return None
        
        trial_request.status = TrialStatus.APPROVED
        trial_request.approved_by = approved_by
        trial_request.approved_at = datetime.utcnow()
        
        db.add(trial_request)
        await db.commit()
        await db.refresh(trial_request)
        return trial_request
    
    async def start_trial(
        self,
        db: AsyncSession,
        *,
        request_id: int,
        processed_by: int
    ) -> Optional[TrialRequest]:
        """トライアルを開始"""
        trial_request = await self.get(db, id=request_id)
        if not trial_request or trial_request.status != TrialStatus.APPROVED:
            return None
        
        trial_request.status = TrialStatus.IN_PROGRESS
        trial_request.actual_start_date = datetime.utcnow()
        trial_request.processed_by = processed_by
        
        db.add(trial_request)
        await db.commit()
        await db.refresh(trial_request)
        return trial_request
    
    async def complete_trial(
        self,
        db: AsyncSession,
        *,
        request_id: int
    ) -> Optional[TrialRequest]:
        """トライアルを完了"""
        trial_request = await self.get(db, id=request_id)
        if not trial_request or trial_request.status != TrialStatus.IN_PROGRESS:
            return None
        
        trial_request.status = TrialStatus.COMPLETED
        trial_request.completion_date = datetime.utcnow()
        
        db.add(trial_request)
        await db.commit()
        await db.refresh(trial_request)
        return trial_request
    
    async def add_feedback(
        self,
        db: AsyncSession,
        *,
        request_id: int,
        rating: int,
        effectiveness_rating: int,
        review: Optional[str] = None,
        purchase_intent: bool = False
    ) -> Optional[TrialRequest]:
        """フィードバックを追加"""
        trial_request = await self.get(db, id=request_id)
        if not trial_request or trial_request.status != TrialStatus.COMPLETED:
            return None
        
        trial_request.customer_rating = rating
        trial_request.effectiveness_rating = effectiveness_rating
        trial_request.customer_review = review
        trial_request.purchase_intent = purchase_intent
        
        db.add(trial_request)
        await db.commit()
        await db.refresh(trial_request)
        return trial_request
    
    async def change_status(
        self,
        db: AsyncSession,
        *,
        request_id: int,
        status: TrialStatus,
        staff_notes: Optional[str] = None
    ) -> Optional[TrialRequest]:
        """ステータスを変更"""
        trial_request = await self.get(db, id=request_id)
        if not trial_request:
            return None
        
        trial_request.status = status
        if staff_notes:
            trial_request.staff_notes = staff_notes
        
        db.add(trial_request)
        await db.commit()
        await db.refresh(trial_request)
        return trial_request


# CRUDインスタンス
trial_request = CRUDTrialRequest(TrialRequest)