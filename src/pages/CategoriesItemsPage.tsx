import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, X, Check, Package, Upload } from 'lucide-react'
import { adminApi } from '@/services/api'

interface Item {
  id: string
  name: string
  name_swahili?: string
  description: string
  image_url: string
  default_price_tzs: number
  unit: string
  is_available: boolean
}

interface Category {
  id: string
  name: string
  name_swahili?: string
  description: string
  image_url: string
  is_active: boolean
  items: Item[]
}

export default function CategoriesItemsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCats, setExpandedCats] = useState<string[]>([])
  const [showAddCat, setShowAddCat] = useState(false)
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState<string | null>(null)
  const [editItemId, setEditItemId] = useState<{ catId: string; itemId: string } | null>(null)

  const [catForm, setCatForm] = useState({ name: '', description: '', image_url: '' })
  const [itemForm, setItemForm] = useState({ name: '', description: '', image_url: '', price: '', unit: 'per piece' })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [savingCat, setSavingCat] = useState(false)
  const [catFormError, setCatFormError] = useState<string | null>(null)
  const [savingItem, setSavingItem] = useState(false)
  const [itemFormError, setItemFormError] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminApi.getCategories()
      if (res.data.success) {
        setCategories(res.data.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  const resetCatForm = () => setCatForm({ name: '', description: '', image_url: '' })
  const resetItemForm = () => setItemForm({ name: '', description: '', image_url: '', price: '', unit: 'per piece' })

  const handleFileUpload = async (file: File, target: 'item' | 'cat', field: string) => {
    setUploadingField(field)
    try {
      const res = await adminApi.uploadImage(file)
      const url = res.data.url
      if (target === 'item') {
        setItemForm((p) => ({ ...p, image_url: url }))
      } else {
        setCatForm((p) => ({ ...p, image_url: url }))
      }
    } catch {
      if (target === 'item') setItemFormError('Failed to upload image.')
      else setCatFormError('Failed to upload image.')
    } finally {
      setUploadingField(null)
    }
  }

  const ImageUploadButton = ({ label, target, field, currentUrl }: { label: string; target: 'item' | 'cat'; field: string; currentUrl: string }) => {
    const inputRef = useRef<HTMLInputElement>(null)
    return (
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>{label}</label>
        {currentUrl ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', background: '#EDE7D9', flexShrink: 0 }}>
              <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <button onClick={() => { if (target === 'item') setItemForm((p) => ({ ...p, image_url: '' })); else setCatForm((p) => ({ ...p, image_url: '' })); }} type="button" style={{ fontSize: 11, color: '#C0553F', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploadingField === field} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', width: '100%',
            border: '1px dashed #CBD5E1', borderRadius: 8, background: '#FAF7F1',
            cursor: uploadingField === field ? 'wait' : 'pointer', fontSize: 12, color: '#64748B',
          }}>
            <Upload size={14} /> {uploadingField === field ? 'Uploading...' : `Upload ${label}`}
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, target, field)
          e.target.value = ''
        }} />
      </div>
    )
  }

  const handleAddCategory = async () => {
    if (!catForm.name.trim()) return
    setSavingCat(true)
    setCatFormError(null)
    try {
      const res = await adminApi.createCategory({
        name: catForm.name,
        description: catForm.description || null,
        image_url: catForm.image_url || null,
      })
      const created = res.data.data
      setCategories((prev) => [...prev, { ...created, items: created.items ?? [] }])
      resetCatForm()
      setShowAddCat(false)
    } catch (err: any) {
      setCatFormError(err?.response?.data?.message || 'Failed to create category.')
    } finally {
      setSavingCat(false)
    }
  }

  const handleEditCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return
    setCatForm({ name: cat.name, description: cat.description, image_url: cat.image_url })
    setCatFormError(null)
    setEditCatId(catId)
  }

  const handleSaveEditCategory = async () => {
    if (!editCatId || !catForm.name.trim()) return
    setSavingCat(true)
    setCatFormError(null)
    try {
      const res = await adminApi.updateCategory(editCatId, {
        name: catForm.name,
        description: catForm.description || null,
        image_url: catForm.image_url || null,
      })
      const updated = res.data.data
      setCategories((prev) => prev.map((c) => (c.id === editCatId ? { ...c, ...updated } : c)))
      setEditCatId(null)
      resetCatForm()
    } catch (err: any) {
      setCatFormError(err?.response?.data?.message || 'Failed to save category.')
    } finally {
      setSavingCat(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Delete this category and all its items?')) return
    try {
      await adminApi.deleteCategory(catId)
      setCategories((prev) => prev.filter((c) => c.id !== catId))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete category.')
    }
  }

  const handleAddItem = async (catId: string) => {
    if (!itemForm.name.trim() || !itemForm.price) return
    setSavingItem(true)
    setItemFormError(null)
    try {
      const res = await adminApi.createItem({
        category_id: catId,
        name: itemForm.name,
        description: itemForm.description || null,
        image_url: itemForm.image_url || null,
        default_price_tzs: Number(itemForm.price),
        unit: itemForm.unit,
      })
      const created = res.data.data
      setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, items: [...c.items, created] } : c)))
      resetItemForm()
      setShowAddItem(null)
    } catch (err: any) {
      setItemFormError(err?.response?.data?.message || 'Failed to add item.')
    } finally {
      setSavingItem(false)
    }
  }

  const handleEditItem = (catId: string, itemId: string) => {
    const cat = categories.find((c) => c.id === catId)
    const item = cat?.items.find((i) => i.id === itemId)
    if (!item) return
    setItemForm({ name: item.name, description: item.description, image_url: item.image_url, price: String(item.default_price_tzs), unit: item.unit })
    setItemFormError(null)
    setEditItemId({ catId, itemId })
  }

  const handleSaveEditItem = async () => {
    if (!editItemId || !itemForm.name.trim()) return
    setSavingItem(true)
    setItemFormError(null)
    try {
      const res = await adminApi.updateItem(editItemId.itemId, {
        name: itemForm.name,
        description: itemForm.description || null,
        image_url: itemForm.image_url || null,
        default_price_tzs: Number(itemForm.price),
        unit: itemForm.unit,
      })
      const updated = res.data.data
      setCategories((prev) => prev.map((c) =>
        c.id === editItemId.catId ? {
          ...c,
          items: c.items.map((i) => (i.id === editItemId.itemId ? { ...i, ...updated } : i)),
        } : c
      ))
      setEditItemId(null)
      resetItemForm()
    } catch (err: any) {
      setItemFormError(err?.response?.data?.message || 'Failed to save item.')
    } finally {
      setSavingItem(false)
    }
  }

  const handleDeleteItem = async (catId: string, itemId: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await adminApi.deleteItem(itemId)
      setCategories((prev) => prev.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      ))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete item.')
    }
  }

  const toggleItemAvailability = async (catId: string, itemId: string) => {
    const cat = categories.find((c) => c.id === catId)
    const item = cat?.items.find((i) => i.id === itemId)
    if (!item) return
    const next = !item.is_available
    setCategories((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, is_available: next } : i)) } : c
    ))
    try {
      await adminApi.updateItem(itemId, { is_available: next })
    } catch {
      setCategories((prev) => prev.map((c) =>
        c.id === catId ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, is_available: !next } : i)) } : c
      ))
    }
  }

  const formatPrice = (price: number) => `TZS ${price.toLocaleString()}`

  if (loading) {
    return (
      <div>
        <div className="title-card">
          <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
            <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
            <li className="sep">/</li>
            <li className="current">Categories & Items</li>
          </ol>
        </div>
        <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
          Loading categories...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="title-card">
          <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
            <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
            <li className="sep">/</li>
            <li className="current">Categories & Items</li>
          </ol>
        </div>
        <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#C0553F' }}>
          {error}
          <button
            onClick={fetchCategories}
            style={{ display: 'block', margin: '12px auto 0', padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Categories & Items</li>
        </ol>
        <button
          onClick={() => { resetCatForm(); setCatFormError(null); setShowAddCat(true) }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
            border: 'none', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Categories list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {categories.map((cat) => {
          const isExpanded = expandedCats.includes(cat.id)
          const isEditingCat = editCatId === cat.id
          return (
            <div key={cat.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Category header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                  cursor: 'pointer', background: isExpanded ? '#FAF7F1' : '#FFFFFF',
                  borderBottom: isExpanded ? '1px solid #EDE7D9' : 'none',
                }}
                onClick={() => toggleCat(cat.id)}
              >
                {isExpanded ? <ChevronDown size={18} style={{ color: '#64748B', flexShrink: 0 }} /> : <ChevronRight size={18} style={{ color: '#64748B', flexShrink: 0 }} />}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                  background: '#EDE7D9',
                }}>
                  <img src={cat.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  {isEditingCat ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          value={catForm.name}
                          onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                          style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 13, fontWeight: 600, color: '#2C3E50', outline: 'none' }}
                          placeholder="Category name"
                        />
                        <input
                          value={catForm.description}
                          onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                          style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 12, color: '#64748B', outline: 'none' }}
                          placeholder="Description"
                        />
                        <button onClick={handleSaveEditCategory} disabled={savingCat} style={{ padding: '6px 10px', borderRadius: 6, background: '#1A5C58', color: '#FFF', border: 'none', cursor: savingCat ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700, opacity: savingCat ? 0.7 : 1 }}><Check size={14} /></button>
                        <button onClick={() => { setEditCatId(null); resetCatForm(); setCatFormError(null) }} style={{ padding: '6px 10px', borderRadius: 6, background: '#F3D5CE', color: '#C0553F', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><X size={14} /></button>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <ImageUploadButton label="Image" target="cat" field={`edit-cat-${cat.id}`} currentUrl={catForm.image_url} />
                      </div>
                      {catFormError && (
                        <div style={{ marginTop: 6, fontSize: 11.5, color: '#C0553F', fontWeight: 600 }}>{catFormError}</div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{cat.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{cat.description} &middot; {cat.items.length} items</div>
                    </>
                  )}
                </div>
                {!isEditingCat && (
                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEditCategory(cat.id)} style={{ padding: 6, borderRadius: 6, background: 'transparent', color: '#64748B', border: 'none', cursor: 'pointer' }} title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteCategory(cat.id)} style={{ padding: 6, borderRadius: 6, background: 'transparent', color: '#C0553F', border: 'none', cursor: 'pointer' }} title="Delete"><X size={14} /></button>
                  </div>
                )}
              </div>

              {/* Items */}
              {isExpanded && (
                <div style={{ padding: '8px 20px 16px' }}>
                  {cat.items.map((item) => {
                    const isEditingItem = editItemId?.catId === cat.id && editItemId?.itemId === item.id
                    return (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: isEditingItem ? 'flex-start' : 'center', gap: 12, padding: '10px 0',
                        borderBottom: '1px solid #F5F0E8',
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                          background: '#EDE7D9',
                        }}>
                          <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        </div>
                        {isEditingItem ? (
                          <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px auto auto', gap: 6, alignItems: 'center' }}>
                              <input value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#2C3E50', outline: 'none' }} placeholder="Name" />
                              <input value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#64748B', outline: 'none' }} placeholder="Description" />
                              <input value={itemForm.price} onChange={(e) => setItemForm((p) => ({ ...p, price: e.target.value }))} type="number" style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#2C3E50', outline: 'none' }} placeholder="Price" />
                              <button onClick={handleSaveEditItem} disabled={savingItem} style={{ padding: '4px 8px', borderRadius: 6, background: '#1A5C58', color: '#FFF', border: 'none', cursor: savingItem ? 'wait' : 'pointer', opacity: savingItem ? 0.7 : 1 }}><Check size={13} /></button>
                              <button onClick={() => { setEditItemId(null); resetItemForm(); setItemFormError(null) }} style={{ padding: '4px 8px', borderRadius: 6, background: '#F3D5CE', color: '#C0553F', border: 'none', cursor: 'pointer' }}><X size={13} /></button>
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <ImageUploadButton label="Image" target="item" field={`edit-item-${item.id}`} currentUrl={itemForm.image_url} />
                            </div>
                            {itemFormError && (
                              <div style={{ marginTop: 6, fontSize: 11.5, color: '#C0553F', fontWeight: 600 }}>{itemFormError}</div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{item.name}</div>
                              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{item.description}</div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A5C58', minWidth: 80, textAlign: 'right' }}>
                              {formatPrice(item.default_price_tzs)}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', minWidth: 60 }}>{item.unit}</div>
                            <button
                              onClick={() => toggleItemAvailability(cat.id, item.id)}
                              style={{
                                padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
                                background: item.is_available ? '#DFF5ED' : '#F3D5CE',
                                color: item.is_available ? '#1A7A5C' : '#C0553F',
                              }}
                            >
                              {item.is_available ? 'Active' : 'Inactive'}
                            </button>
                            <div style={{ display: 'flex', gap: 2 }}>
                              <button onClick={() => handleEditItem(cat.id, item.id)} style={{ padding: 4, borderRadius: 4, background: 'transparent', color: '#64748B', border: 'none', cursor: 'pointer' }}><Pencil size={13} /></button>
                              <button onClick={() => handleDeleteItem(cat.id, item.id)} style={{ padding: 4, borderRadius: 4, background: 'transparent', color: '#C0553F', border: 'none', cursor: 'pointer' }}><X size={13} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}

                  {/* Add item form */}
                  {showAddItem === cat.id ? (
                    <div style={{
                      background: '#FAF7F1', borderRadius: 8, marginTop: 8, padding: '12px',
                    }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#EDE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {itemForm.image_url ? (
                            <img src={itemForm.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          ) : (
                            <Package size={16} style={{ color: '#64748B' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 13, color: '#2C3E50', outline: 'none' }} placeholder="Item name" />
                            <input value={itemForm.price} onChange={(e) => setItemForm((p) => ({ ...p, price: e.target.value }))} type="number" style={{ width: 100, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 13, color: '#2C3E50', outline: 'none' }} placeholder="Price (TZS)" />
                            <select value={itemForm.unit} onChange={(e) => setItemForm((p) => ({ ...p, unit: e.target.value }))} style={{ width: 110, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#2C3E50', background: '#FFF', outline: 'none' }}>
                              <option value="per piece">per piece</option>
                              <option value="per kg">per kg</option>
                              <option value="per pair">per pair</option>
                              <option value="per set">per set</option>
                              <option value="per order">per order</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 12, color: '#64748B', outline: 'none' }} placeholder="Description (optional)" />
                          </div>
                          <ImageUploadButton label="Image" target="item" field={`add-item-${cat.id}`} currentUrl={itemForm.image_url} />
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
                          <button onClick={() => handleAddItem(cat.id)} disabled={savingItem} style={{ padding: '6px 12px', borderRadius: 6, background: '#1A5C58', color: '#FFF', border: 'none', cursor: savingItem ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700, opacity: savingItem ? 0.7 : 1 }}>{savingItem ? 'Adding...' : 'Add'}</button>
                          <button onClick={() => { setShowAddItem(null); resetItemForm(); setItemFormError(null) }} style={{ padding: '6px 12px', borderRadius: 6, background: '#F3D5CE', color: '#C0553F', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Cancel</button>
                        </div>
                      </div>
                      {itemFormError && (
                        <div style={{ marginTop: 8, fontSize: 11.5, color: '#C0553F', fontWeight: 600 }}>{itemFormError}</div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { resetItemForm(); setItemFormError(null); setShowAddItem(cat.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                        marginTop: 8, fontSize: 12, fontWeight: 700, color: '#1A5C58',
                        background: 'transparent', border: '1px dashed #1A5C5850', borderRadius: 8,
                        cursor: 'pointer', width: '100%', justifyContent: 'center',
                      }}
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Category modal */}
      {showAddCat && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => { setShowAddCat(false); setCatFormError(null) }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Add Category</div>
            {/* Preview */}
            {catForm.image_url && (
              <div style={{ width: '100%', height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 12, background: '#EDE7D9' }}>
                <img src={catForm.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Category Name</label>
                <input value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard Everyday Wear" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Description</label>
                <input value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none' }} />
              </div>
              <ImageUploadButton label="Image" target="cat" field="add-cat" currentUrl={catForm.image_url} />
            </div>
            {catFormError && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}>
                {catFormError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => { setShowAddCat(false); setCatFormError(null) }} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddCategory} disabled={savingCat} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 9, cursor: savingCat ? 'wait' : 'pointer', opacity: savingCat ? 0.7 : 1 }}>{savingCat ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
