const { getItemsWithText, getUserHistory } = require("../service/recommenderService");
const { recommendTFIDF } = require("../model/recommender_Models");

const recommendForUser = async (userId) => {
    try {
        const items = await getItemsWithText();
        console.log("Items check >>>>>>>" ,items);

        const history = await getUserHistory(userId);
        console.log("history>>>>>>", history);
        const recommended = recommendTFIDF(items, history, 10);
        console.log("Recommender>>>>>>>", recommended)
        return recommended;

    } catch (err) {
        console.error("Error in recommendForUser:", err);
        return [];
    }
};

module.exports = { recommendForUser };
