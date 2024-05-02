function list(query = {}) {
  return [
    {
      $match: {
        status: { $ne: "deleted" },
        ...query,
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "id",
        as: "customer",
      },
    },
    {
      $addFields: {
        customerName: {
          $concat: [
            {
              $first: "$customer.firstName",
            },
            " ",
            {
              $first: "$customer.lastName",
            },
          ],
        },
      },
    },
    {
      $unset: ["customer", "__v", "-id"],
    },
  ];
}

module.exports = list;
