import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "", // 🔥 ADD THIS
    category: "",
    material: "",
    color: "",
    countInStock: "",
    isTrending: false,
    description: "",
    images: [],
    previews: [],
  });

  useEffect(() => {
    return () => {
      form.previews.forEach((item) => {
        if (!item.isExisting && item.src?.startsWith("blob:")) {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, [form.previews]);

  // 🔥 FETCH PRODUCT (EDIT MODE)
  useEffect(() => {
    if (id) {
      setLoading(true);

      fetch(`http://localhost:5001/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({
            name: data.name || "",
            price: data.price || "",
            originalPrice: data.originalPrice || "", // 🔥 ADD
            category: data.category || "",
            material: data.material || "",
            color: data.color || "",
            countInStock: data.countInStock || "",
            isTrending: Boolean(data.isTrending),
            description: data.description || "",
            images: [],
            previews: data.images
              ? data.images.map((img, index) => ({
                  id: `existing-${index}-${img}`,
                  src: `http://localhost:5001${img}`,
                  fileName: img.split("/").pop() || `Saved image ${index + 1}`,
                  meta: "Saved image",
                  isExisting: true,
                  serverPath: img,
                }))
              : [],
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // 🔥 INPUT HANDLE
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === "images") {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) {
        return;
      }

      const appendedPreviewItems = fileArray.map((file, index) => ({
        id: `new-${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
        src: URL.createObjectURL(file),
        fileName: file.name,
        meta: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        isExisting: false,
        file,
      }));

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...fileArray],
        previews: [...prev.previews, ...appendedPreviewItems],
      }));

      e.target.value = "";
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleRemoveImage = (imageId) => {
    setForm((prev) => {
      const selectedItem = prev.previews.find((item) => item.id === imageId);

      if (!selectedItem) {
        return prev;
      }

      if (!selectedItem.isExisting && selectedItem.src?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedItem.src);
      }

      return {
        ...prev,
        images: selectedItem.isExisting
          ? prev.images
          : prev.images.filter((file) => file !== selectedItem.file),
        previews: prev.previews.filter((item) => item.id !== imageId),
      };
    });
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("originalPrice", form.originalPrice);
      formData.append("category", form.category);
      formData.append("material", form.material);
      formData.append("color", form.color);
      formData.append("countInStock", form.countInStock);
      formData.append("isTrending", form.isTrending);
      formData.append("description", form.description);
      formData.append(
        "retainedImages",
        JSON.stringify(
          form.previews
            .filter((item) => item.isExisting)
            .map((item) => item.serverPath),
        ),
      );

      // 🔥 MULTIPLE IMAGES SEND
      form.images.forEach((img) => {
        formData.append("images", img);
      });

      const url = id
        ? `http://localhost:5001/api/products/${id}`
        : "http://localhost:5001/api/products";

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(id ? "Product Updated ✅" : "Product Added ✅");

      form.previews.forEach((item) => {
        if (!item.isExisting && item.src?.startsWith("blob:")) {
          URL.revokeObjectURL(item.src);
        }
      });

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page admin-product-form-page">
      <div className="admin-product-form-shell">
        <div className="admin-product-form-head">
          <h2 className="title">{id ? "Edit Product" : "Add Product"}</h2>
        </div>

        {loading && <p className="admin-product-form-loading">Loading...</p>}

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-form-layout">
            <section className="admin-product-panel admin-product-upload-panel">
              <div className="admin-product-panel-head">
                <h3>Add Images</h3>
              </div>

              <label className="admin-product-dropzone">
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                />
                <span className="admin-product-dropzone-visual" aria-hidden="true">
                  <svg viewBox="0 0 64 64" className="admin-product-dropzone-icon">
                    <rect
                      x="14"
                      y="14"
                      width="36"
                      height="30"
                      rx="6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                    />
                    <circle
                      cx="25"
                      cy="25"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                    />
                    <path
                      d="M18 39l10-10 7 7 8-9 7 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="admin-product-dropzone-copy">
                  Drop your files here, or <strong>Browse</strong>
                </span>
              </label>

              {form.previews.length > 0 && (
                <div className="admin-product-file-list">
                  {form.previews.map((item) => (
                    <div key={item.id} className="admin-product-file-item">
                      <img src={item.src} alt={item.fileName} />
                      <div className="admin-product-file-copy">
                        <strong>{item.fileName}</strong>
                        <span>{item.meta}</span>
                      </div>
                      <button
                        type="button"
                        className="admin-product-file-remove"
                        onClick={() => handleRemoveImage(item.id)}
                        aria-label={`Remove ${item.fileName}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-product-panel admin-product-details-panel">
              <div className="product-form-grid">
                <div className="product-form-field product-form-field-full admin-form-name-field">
                  <label htmlFor="product-name">Product Name</label>
                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-category">Category</label>
                  <input
                    id="product-category"
                    type="text"
                    name="category"
                    placeholder="e.g. Earrings"
                    value={form.category}
                    onChange={handleChange}
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-material">Material</label>
                  <input
                    id="product-material"
                    type="text"
                    name="material"
                    placeholder="e.g. Stainless Steel"
                    value={form.material}
                    onChange={handleChange}
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-color">Color</label>
                  <input
                    id="product-color"
                    type="text"
                    name="color"
                    placeholder="e.g. Gold"
                    value={form.color}
                    onChange={handleChange}
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-stock">Stock</label>
                  <input
                    id="product-stock"
                    type="number"
                    name="countInStock"
                    placeholder="Available quantity"
                    value={form.countInStock}
                    onChange={handleChange}
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-price">Price</label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    placeholder="Enter selling price"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-original-price">Original Price</label>
                  <input
                    id="product-original-price"
                    type="number"
                    name="originalPrice"
                    placeholder="Enter original price"
                    value={form.originalPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="product-form-field product-form-field-full">
                  <label htmlFor="product-description">Description</label>
                  <textarea
                    id="product-description"
                    name="description"
                    placeholder="Write a polished product description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="product-form-field product-form-field-full">
                  <label className="product-form-toggle">
                    <input
                      type="checkbox"
                      name="isTrending"
                      checked={form.isTrending}
                      onChange={handleChange}
                    />
                    <span className="product-form-toggle-box" />
                    <span className="product-form-toggle-copy">
                      <strong>Show in Trending</strong>
                      <small>
                        Display this product in the home page trending panel.
                      </small>
                    </span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className="product-form-actions">
            <button type="submit" className="button product-form-submit">
              {id ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductFormPage;
