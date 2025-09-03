'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Loader2, Save, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { 
  CreateProductSchema, 
  UpdateProductSchema,
  type CreateProduct,
  type UpdateProduct,
  type Product,
  CATEGORY_LABELS,
  STATUS_LABELS
} from '@/lib/schemas/product'
import { useCreateProduct, useUpdateProduct, useUploadProductImage } from '@/lib/hooks/useProducts'

interface ProductFormProps {
  mode: 'create' | 'edit'
  product?: Product
  onSuccess?: (product: Product) => void
  onCancel?: () => void
}

export default function ProductForm({ mode, product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = mode === 'edit'
  const schema = isEdit ? UpdateProductSchema : CreateProductSchema
  
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const uploadImage = useUploadProductImage()

  const form = useForm<CreateProduct | UpdateProduct>({
    resolver: zodResolver(schema),
    defaultValues: isEdit && product ? {
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      category: product.category,
      status: product.status,
      price: product.price,
      cost: product.cost,
      sku: product.sku,
      barcode: product.barcode,
      brand: product.brand,
      manufacturer: product.manufacturer,
      weight: product.weight,
      dimensions: product.dimensions,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      max_stock_level: product.max_stock_level,
      is_featured: product.is_featured,
      is_trial_available: product.is_trial_available,
      trial_price: product.trial_price,
      trial_duration_days: product.trial_duration_days,
      ingredients: product.ingredients,
      usage_instructions: product.usage_instructions,
      warnings: product.warnings,
    } : {
      name: '',
      category: 'OTHER',
      status: 'ACTIVE',
      price: 0,
      sku: '',
      stock_quantity: 0,
      min_stock_level: 0,
      is_featured: false,
      is_trial_available: false,
      trial_duration_days: 7,
    }
  })

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    product?.image_url || null
  )

  // 画像選択処理
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('画像ファイルは5MB以下にしてください')
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setSelectedImage(file)

    // プレビュー生成
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 画像削除処理
  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
    form.setValue('image_url', '')
  }

  // フォーム送信処理
  const handleSubmit = async (data: CreateProduct | UpdateProduct) => {
    try {
      let savedProduct: Product

      if (isEdit && product) {
        // 更新処理
        savedProduct = await updateProduct.mutateAsync({ 
          id: product.id, 
          data: data as UpdateProduct 
        })
      } else {
        // 新規作成処理
        savedProduct = await createProduct.mutateAsync(data as CreateProduct)
      }

      // 画像アップロード（選択されている場合）
      if (selectedImage && savedProduct) {
        await uploadImage.mutateAsync({
          id: savedProduct.id,
          file: selectedImage
        })
      }

      // 成功コールバック
      if (onSuccess) {
        onSuccess(savedProduct)
      }
      
      // フォームリセット（新規作成時のみ）
      if (!isEdit) {
        form.reset()
        setSelectedImage(null)
        setImagePreview(null)
      }

    } catch (error) {
      console.error('Product save error:', error)
    }
  }

  const isLoading = createProduct.isPending || updateProduct.isPending || uploadImage.isPending

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isEdit ? '商品編集' : '商品追加'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 基本情報セクション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">商品名 *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="商品名を入力"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  {...form.register('sku')}
                  placeholder="SKUを入力"
                />
                {form.formState.errors.sku && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.sku.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">カテゴリ *</Label>
                  <Select
                    value={form.watch('category')}
                    onValueChange={(value) => form.setValue('category', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">ステータス</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) => form.setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">価格 (円) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register('price', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cost">原価 (円)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    {...form.register('cost', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* 画像アップロードセクション */}
            <div className="space-y-4">
              <Label>商品画像</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="商品画像プレビュー"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleImageRemove}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      画像をアップロード (最大5MB)
                    </p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          {/* 説明セクション */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="short_description">短い説明</Label>
              <Input
                id="short_description"
                {...form.register('short_description')}
                placeholder="商品の短い説明"
              />
            </div>

            <div>
              <Label htmlFor="description">詳細説明</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="商品の詳細な説明"
                rows={4}
              />
            </div>
          </div>

          {/* 在庫・トライアル設定セクション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">在庫管理</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">現在在庫</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    {...form.register('stock_quantity', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="min_stock_level">最小在庫</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    {...form.register('min_stock_level', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="max_stock_level">最大在庫</Label>
                  <Input
                    id="max_stock_level"
                    type="number"
                    {...form.register('max_stock_level', { valueAsNumber: true })}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">トライアル設定</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_trial_available"
                    checked={form.watch('is_trial_available')}
                    onCheckedChange={(checked) => 
                      form.setValue('is_trial_available', checked as boolean)
                    }
                  />
                  <Label htmlFor="is_trial_available">トライアル対応</Label>
                </div>

                {form.watch('is_trial_available') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trial_price">トライアル価格</Label>
                      <Input
                        id="trial_price"
                        type="number"
                        step="0.01"
                        {...form.register('trial_price', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="trial_duration_days">期間(日)</Label>
                      <Input
                        id="trial_duration_days"
                        type="number"
                        {...form.register('trial_duration_days', { valueAsNumber: true })}
                        placeholder="7"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* その他の設定 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={form.watch('is_featured')}
                  onCheckedChange={(checked) => 
                    form.setValue('is_featured', checked as boolean)
                  }
                />
                <Label htmlFor="is_featured">おすすめ商品</Label>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                キャンセル
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  {isEdit ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isEdit ? '更新' : '作成'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}