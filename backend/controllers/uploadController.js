const uploadImage = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }

  res.status(201).json({
    message: "Image uploaded successfully",
    imageUrl: `/uploads/${req.file.filename}`
  });
};

export { uploadImage };
