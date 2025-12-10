// src/controller/recommenderController.js
const { getItemsWithText, getUserHistory } = require("../service/recommenderService");
const { recommendTFIDF } = require("../model/recommender_Models");

const recommendForUser = async (userId) => {
  try {
    const items = await getItemsWithText();
    const history = await getUserHistory(userId);

    const recommended = recommendTFIDF(items, history, 10);
    return recommended;
  } catch (err) {
    console.error("Error in recommendForUser:", err);
    return [];
  }
};

module.exports = { recommendForUser };
