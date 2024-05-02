const supertest = require("supertest");
const app = require("../../helpers/ExpressApp.helper")();

module.exports = () => {
  test("Should return 200", async () => {
    await supertest(app).get("/").expect(200);
  });

  describe("Auth Module", require("./auth.test"));
  describe("User Management Module", () => {
    describe("Role Module", require("./userManagement/role.test"));
    describe("User Module", require("./userManagement/user.test"));
  });

  describe("Inventory Module", () => {
    describe("Category Module", require("./inventory/category.test"));
    describe("Item Module", require("./inventory/item.test"));
    describe("Subcategory Module", require("./inventory/subcategory.test"));
    describe("Warehouse Module", require("./inventory/warehouse.test"));
    describe("Manufacture Module", require("./inventory/manufacture.test"));
    describe("Stock Module", require("./inventory/stock.test"));
  });

  describe("Settings Module", () => {
    describe("Currency Module", require("./settings/currency.test"));
    describe("Policy Module", require("./settings/policy.test"));
    describe("Email Module", require("./settings/email.test"));
    describe("Tax Module", require("./settings/tax.test"));
    describe(
      "TermsAndCondition Module",
      require("./settings/terms-and-condition.test")
    );
  });

  describe("Purchase Module", () => {
    describe("Project Module", require("./purchase/project.test"));
    describe("Vendor Module", require("./purchase/vendor.test"));
    describe("Request Module", require("./purchase/request.test"));
    describe("Quotation Module", require("./purchase/quotation.test"));
    describe("Order Module", require("./purchase/order.test"));
    describe("RFQ Module", require("./purchase/rfq.test"));
    describe("Receive Module", require("./purchase/receive.test"));
  });

  describe("Resources Module", () => {
    describe("Client Module", require("./resources/client.test"));
    describe("Indentor Module", require("./resources/indentor.test"));
  });
};
