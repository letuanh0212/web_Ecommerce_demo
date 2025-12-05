const { recommendForUser } = require("./src/controller/recommenderController.js");
async function test() {
    const userId = 11; // id user cần gợi ý
    const recommended = await recommendForUser(userId);
    console.log("Recommended items:", recommended);
}

test();
