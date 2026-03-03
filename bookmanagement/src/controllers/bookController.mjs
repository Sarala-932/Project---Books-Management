import bookModel from "../models/bookModel.mjs";
import userModel from "../models/userModel.mjs";
import mongoose from "mongoose";

const createBook = async (req, res) => {
  try {
    const data = req.body;
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;

    // 1. Validate request body is not empty
    if (Object.keys(data).length === 0) {
      return res.status(400).send({
        status: false,
        message: "Request body cannot be empty",
      });
    }

    // 2. Validate mandatory fields
    if (!title) return res.status(400).send({ status: false, message: "Title is required" });
    if (!excerpt) return res.status(400).send({ status: false, message: "Excerpt is required" });
    if (!userId) return res.status(400).send({ status: false, message: "UserId is required" });
    if (!ISBN) return res.status(400).send({ status: false, message: "ISBN is required" });
    if (!category) return res.status(400).send({ status: false, message: "Category is required" });
    if (!subcategory) return res.status(400).send({ status: false, message: "Subcategory is required" });
    if (!releasedAt) return res.status(400).send({ status: false, message: "Released date is required" });

    // 2.5. Validate releasedAt format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(releasedAt)) {
      return res.status(400).send({
        status: false,
        message: "Released date must be in YYYY-MM-DD format",
      });
    }

    // 3. Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        status: false,
        message: "Invalid userId format",
      });
    }

    // 4. Check if user exists
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return res.status(400).send({
        status: false,
        message: "User does not exist",
      });
    }

    // 5. Check for unique title and ISBN
    const isTitleUnique = await bookModel.findOne({ title });
    if (isTitleUnique) {
      return res.status(400).send({ status: false, message: "Title already exists" });
    }
    const isISBNUnique = await bookModel.findOne({ ISBN });
    if (isISBNUnique) {
      return res.status(400).send({ status: false, message: "ISBN already exists" });
    }

    // 6. Create book
    const bookData = {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt,
    };

    const book = await bookModel.create(bookData);

    // 7. Success response
    return res.status(201).send({
      status: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const query = req.query;
    const { userId, category, subcategory } = query;

    const filter = { isDeleted: false };
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({ status: false, message: "Invalid userId format" });
      }
      filter.userId = userId;
    }
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    const books = await bookModel
      .find(filter)
      .select("_id title excerpt userId category releasedAt reviews")
      .sort({ title: 1 });

    if (books.length === 0) {
      return res.status(404).send({ status: false, message: "No books found" });
    }

    return res.status(200).send({ status: true, message: "Success", data: books });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

export { createBook, getBooks };
