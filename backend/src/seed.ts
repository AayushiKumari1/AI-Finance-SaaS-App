import "dotenv/config";
import mongoose from "mongoose";

import TransactionModel from "./models/transaction.model.js";

const COUNT = 5000; 
const USER_ID = "6adcacf7fd6161ff27592fa4";

const categories: string[] = [
  "Groceries", "Rent", "Transport", "Dining", "Utilities",
  "Shopping", "Health", "Entertainment", "Salary", "Freelance",
];

const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: T[]): T => {
  if (arr.length === 0) throw new Error("Cannot pick from an empty array");
  return arr[rand(0, arr.length - 1)]!;
};

function randomDate(): Date {
  const now = Date.now();
  const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000;
  return new Date(rand(twoYearsAgo, now));
}

function makeTransaction() {
  const category = pick(categories);
  const isIncome = category === "Salary" || category === "Freelance";
  return {
    userId: new mongoose.Types.ObjectId(USER_ID),
    type: isIncome ? "INCOME" : "EXPENSE",
    title: `Seed: ${category}`,
    amount: isIncome ? rand(20000, 80000) : rand(50, 5000),
    category,
    description: `Seed: ${category}`,
    date: randomDate(),
  };
}

async function run(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI as string);
  const docs = Array.from({ length: COUNT }, makeTransaction);
  await TransactionModel.insertMany(docs);
  console.log(`Inserted ${COUNT} transactions`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});