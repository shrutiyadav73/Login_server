function list(query = {}) {
  return [
    {
      $match: {
        status: {
          $ne: "deleted",
        },
        ...query,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "id",
        as: "categories",
      },
    },
    {
      $addFields: {
        category: {
          $first: "$categories.name",
        },
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "subcategoryId",
        foreignField: "id",
        as: "subcategories",
      },
    },
    {
      $addFields: {
        subcategory: {
          $first: "$subcategories.name",
        },
      },
    },
    {
      $unset: [
        "__v",
        "_id",
        "pr.__v",
        "pr._id",
        "createdByUser",
        "updatedByUser",
        "client",
        "project",
        "prApproverUser",
        "poApproverObj",
      ],
    },
  ];
}

module.exports = list;
