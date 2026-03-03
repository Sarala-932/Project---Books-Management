import mongoose from 'mongoose';
import config from './config.mjs';
import bookModel from './src/models/bookModel.mjs';
import userModel from './src/models/userModel.mjs';

const seedBooks = async () => {
  try {
    if (!config.mongoURI) {
      console.error('MongoDB URI not found in config/env');
      process.exit(1);
    }

    await mongoose.connect(config.mongoURI);
    const users = await userModel.find();

    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      process.exit(0);
    }

    console.log(`Seeding books for ${users.length} users...`);

    for (const user of users) {
      const existingBooks = await bookModel.countDocuments({ userId: user._id });
      const booksToCreate = Math.max(0, 10 - existingBooks);

      if (booksToCreate > 0) {
        console.log(`Creating ${booksToCreate} books for user ${user.email}...`);
        for (let i = 0; i < booksToCreate; i++) {
          await bookModel.create({
            title: `Book ${i + 1} by ${user.name} - ${Date.now()}`,
            excerpt: `This is a sample book excerpt for book ${i + 1}.`,
            userId: user._id,
            ISBN: `ISBN-${user._id}-${i}-${Date.now()}`,
            category: 'Fiction',
            subcategory: 'Fantasy',
            releasedAt: '2023-01-01',
          });
        }
      } else {
        console.log(`User ${user.email} already has ${existingBooks} books.`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding books:', err);
    process.exit(1);
  }
};

seedBooks();
