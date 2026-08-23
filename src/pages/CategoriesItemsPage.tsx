import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, X, Check, Package } from 'lucide-react'

interface Item {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
  unit: string
  available: boolean
}

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
  items: Item[]
}

const initialCategories: Category[] = [
  {
    id: 'standard-wear',
    name: 'Standard Everyday Wear',
    description: 'Daily clothing items for casual and work use',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    items: [
      { id: 'tshirt', name: 'T-Shirt / Polo', description: 'Wash, dry, & fold / light press', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200', price: 2250, unit: 'per piece', available: true },
      { id: 'casual-shirt', name: 'Casual Shirt', description: 'Wash, dry, & fold / light press', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200', price: 3500, unit: 'per piece', available: true },
      { id: 'trousers', name: 'Trousers', description: 'Wash, dry, & press', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200', price: 4000, unit: 'per piece', available: true },
      { id: 'shorts', name: 'Shorts', description: 'Wash, dry, & fold', imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200', price: 2000, unit: 'per piece', available: true },
      { id: 'underwear', name: 'Underwear', description: 'Wash, dry, & fold', imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=200', price: 1500, unit: 'per piece', available: true },
    ],
  },
  {
    id: 'formal-outerwear',
    name: 'Formal, Woolen & Outerwear',
    description: 'Suits, jackets, coats and formal garments',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
    items: [
      { id: 'suit-2pc', name: '2-Piece Suit', description: 'Dry clean, press & protect', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200', price: 15000, unit: 'per set', available: true },
      { id: 'suit-3pc', name: '3-Piece Suit', description: 'Dry clean, press & protect', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200', price: 20000, unit: 'per set', available: true },
      { id: 'jacket', name: 'Jacket', description: 'Dry clean & press', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200', price: 8000, unit: 'per piece', available: true },
      { id: 'coat', name: 'Coat', description: 'Dry clean & press', imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200', price: 12000, unit: 'per piece', available: true },
      { id: 'evening-gown', name: 'Evening Gown', description: 'Delicate dry clean', imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200', price: 25000, unit: 'per piece', available: true },
    ],
  },
  {
    id: 'footwear-bags',
    name: 'Footwear & Bags Care',
    description: 'Sneakers, leather shoes, bags and accessories',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    items: [
      { id: 'sneakers', name: 'Sneakers', description: 'Deep clean & deodorize', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200', price: 5000, unit: 'per pair', available: true },
      { id: 'leather-shoes', name: 'Leather Shoes', description: 'Clean, condition & polish', imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=200', price: 7000, unit: 'per pair', available: true },
      { id: 'backpack', name: 'Backpack', description: 'Spot clean & freshen', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200', price: 6000, unit: 'per piece', available: true },
      { id: 'handbag', name: 'Handbag', description: 'Condition & clean', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200', price: 8000, unit: 'per piece', available: true },
    ],
  },
  {
    id: 'bedding-household',
    name: 'Bedding, Household & Heavy Fabrics',
    description: 'Blankets, sheets, curtains and household items',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
    items: [
      { id: 'blanket', name: 'Blanket', description: 'Wash, dry & fold', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200', price: 8000, unit: 'per piece', available: true },
      { id: 'duvet', name: 'Duvet', description: 'Deep wash & sanitize', imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=200', price: 12000, unit: 'per piece', available: true },
      { id: 'bedsheet', name: 'Bedsheet', description: 'Wash, dry & iron', imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200', price: 5000, unit: 'per piece', available: true },
      { id: 'curtains', name: 'Curtains', description: 'Wash, dry & press', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200', price: 10000, unit: 'per piece', available: true },
    ],
  },
  {
    id: 'bulk-addons',
    name: 'Bulk Services & Add-Ons',
    description: 'Bulk wash, ironing, express and pickup services',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
    items: [
      { id: 'bulk-wash', name: 'Bulk Wash / kg', description: 'Per kilogram wash & fold', imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200', price: 1800, unit: 'per kg', available: true },
      { id: 'ironing', name: 'Ironing', description: 'Professional press per item', imageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=200', price: 1500, unit: 'per piece', available: true },
      { id: 'express-fee', name: 'Express Fee', description: '6-hour express turnaround', imageUrl: 'https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?w=200', price: 5000, unit: 'per order', available: true },
      { id: 'pickup-fee', name: 'Pickup Fee', description: 'Doorstep pickup service', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200', price: 3000, unit: 'per order', available: true },
    ],
  },
]

export default function CategoriesItemsPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [expandedCats, setExpandedCats] = useState<string[]>(['standard-wear'])
  const [showAddCat, setShowAddCat] = useState(false)
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState<string | null>(null)
  const [editItemId, setEditItemId] = useState<{ catId: string; itemId: string } | null>(null)

  const [catForm, setCatForm] = useState({ name: '', description: '', imageUrl: '' })
  const [itemForm, setItemForm] = useState({ name: '', description: '', imageUrl: '', price: '', unit: 'per piece' })

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  const resetCatForm = () => setCatForm({ name: '', description: '', imageUrl: '' })
  const resetItemForm = () => setItemForm({ name: '', description: '', imageUrl: '', price: '', unit: 'per piece' })

  const handleAddCategory = () => {
    if (!catForm.name.trim()) return
    const newCat: Category = {
      id: catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: catForm.name,
      description: catForm.description,
      imageUrl: catForm.imageUrl || 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
      items: [],
    }
    setCategories((prev) => [...prev, newCat])
    setExpandedCats((prev) => [...prev, newCat.id])
    resetCatForm()
    setShowAddCat(false)
  }

  const handleEditCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return
    setCatForm({ name: cat.name, description: cat.description, imageUrl: cat.imageUrl })
    setEditCatId(catId)
  }

  const handleSaveEditCategory = () => {
    if (!editCatId || !catForm.name.trim()) return
    setCategories((prev) => prev.map((c) =>
      c.id === editCatId ? { ...c, name: catForm.name, description: catForm.description, imageUrl: catForm.imageUrl } : c
    ))
    setEditCatId(null)
    resetCatForm()
  }

  const handleDeleteCategory = (catId: string) => {
    if (!confirm('Delete this category and all its items?')) return
    setCategories((prev) => prev.filter((c) => c.id !== catId))
  }

  const handleAddItem = (catId: string) => {
    if (!itemForm.name.trim() || !itemForm.price) return
    const newItem: Item = {
      id: itemForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: itemForm.name,
      description: itemForm.description,
      imageUrl: itemForm.imageUrl || 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200',
      price: Number(itemForm.price),
      unit: itemForm.unit,
      available: true,
    }
    setCategories((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: [...c.items, newItem] } : c
    ))
    resetItemForm()
    setShowAddItem(null)
  }

  const handleEditItem = (catId: string, itemId: string) => {
    const cat = categories.find((c) => c.id === catId)
    const item = cat?.items.find((i) => i.id === itemId)
    if (!item) return
    setItemForm({ name: item.name, description: item.description, imageUrl: item.imageUrl, price: String(item.price), unit: item.unit })
    setEditItemId({ catId, itemId })
  }

  const handleSaveEditItem = () => {
    if (!editItemId || !itemForm.name.trim()) return
    setCategories((prev) => prev.map((c) =>
      c.id === editItemId.catId ? {
        ...c,
        items: c.items.map((i) =>
          i.id === editItemId.itemId ? { ...i, name: itemForm.name, description: itemForm.description, imageUrl: itemForm.imageUrl, price: Number(itemForm.price), unit: itemForm.unit } : i
        ),
      } : c
    ))
    setEditItemId(null)
    resetItemForm()
  }

  const handleDeleteItem = (catId: string, itemId: string) => {
    if (!confirm('Delete this item?')) return
    setCategories((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
    ))
  }

  const toggleItemAvailability = (catId: string, itemId: string) => {
    setCategories((prev) => prev.map((c) =>
      c.id === catId ? {
        ...c,
        items: c.items.map((i) => i.id === itemId ? { ...i, available: !i.available } : i),
      } : c
    ))
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
          onClick={() => { resetCatForm(); setShowAddCat(true) }}
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
                  <img src={cat.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  {isEditingCat ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
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
                      <button onClick={handleSaveEditCategory} style={{ padding: '6px 10px', borderRadius: 6, background: '#1A5C58', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><Check size={14} /></button>
                      <button onClick={() => { setEditCatId(null); resetCatForm() }} style={{ padding: '6px 10px', borderRadius: 6, background: '#F3D5CE', color: '#C0553F', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}><X size={14} /></button>
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
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                        borderBottom: '1px solid #F5F0E8',
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                          background: '#EDE7D9',
                        }}>
                          <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        </div>
                        {isEditingItem ? (
                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px auto auto', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#2C3E50', outline: 'none' }} placeholder="Name" />
                            <input value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#64748B', outline: 'none' }} placeholder="Description" />
                            <input value={itemForm.imageUrl} onChange={(e) => setItemForm((p) => ({ ...p, imageUrl: e.target.value }))} style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#64748B', outline: 'none' }} placeholder="Image URL" />
                            <input value={itemForm.price} onChange={(e) => setItemForm((p) => ({ ...p, price: e.target.value }))} type="number" style={{ height: 30, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 12, color: '#2C3E50', outline: 'none' }} placeholder="Price" />
                            <button onClick={handleSaveEditItem} style={{ padding: '4px 8px', borderRadius: 6, background: '#1A5C58', color: '#FFF', border: 'none', cursor: 'pointer' }}><Check size={13} /></button>
                            <button onClick={() => { setEditItemId(null); resetItemForm() }} style={{ padding: '4px 8px', borderRadius: 6, background: '#F3D5CE', color: '#C0553F', border: 'none', cursor: 'pointer' }}><X size={13} /></button>
                          </div>
                        ) : (
                          <>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{item.name}</div>
                              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{item.description}</div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A5C58', minWidth: 80, textAlign: 'right' }}>
                              TZS {item.price.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', minWidth: 60 }}>{item.unit}</div>
                            <button
                              onClick={() => toggleItemAvailability(cat.id, item.id)}
                              style={{
                                padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
                                background: item.available ? '#DFF5ED' : '#F3D5CE',
                                color: item.available ? '#1A7A5C' : '#C0553F',
                              }}
                            >
                              {item.available ? 'Active' : 'Inactive'}
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
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#FAF7F1', borderRadius: 8, marginTop: 8, padding: '12px',
                    }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#EDE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {itemForm.imageUrl ? (
                          <img src={itemForm.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
                          <input value={itemForm.imageUrl} onChange={(e) => setItemForm((p) => ({ ...p, imageUrl: e.target.value }))} style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 12, color: '#64748B', outline: 'none' }} placeholder="Image URL (optional)" />
                          <input value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 12, color: '#64748B', outline: 'none' }} placeholder="Description (optional)" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
                        <button onClick={() => handleAddItem(cat.id)} style={{ padding: '6px 12px', borderRadius: 6, background: '#1A5C58', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Add</button>
                        <button onClick={() => { setShowAddItem(null); resetItemForm() }} style={{ padding: '6px 12px', borderRadius: 6, background: '#F3D5CE', color: '#C0553F', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { resetItemForm(); setShowAddItem(cat.id) }}
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowAddCat(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Add Category</div>
            {/* Preview */}
            {catForm.imageUrl && (
              <div style={{ width: '100%', height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 12, background: '#EDE7D9' }}>
                <img src={catForm.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Category Name', key: 'name', placeholder: 'e.g. Standard Everyday Wear' },
                { label: 'Description', key: 'description', placeholder: 'Brief description' },
                { label: 'Image URL', key: 'imageUrl', placeholder: 'https://...' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>{f.label}</label>
                  <input
                    value={(catForm as any)[f.key]}
                    onChange={(e) => setCatForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                      padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowAddCat(false)} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddCategory} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer' }}>Create</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
