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
        from: "clients",
        localField: "clientId",
        foreignField: "id",
        as: "client",
      },
    },
    {
      $addFields: {
        client: {
          $first: "$client.name",
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "id",
        as: "createdByUser",
      },
    },
    {
      $addFields: {
        createdByName: {
          $first: "$createdByUser.name",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "id",
        as: "updatedByUser",
      },
    },
    {
      $addFields: {
        updatedByName: {
          $first: "$updatedByUser.name",
        },
      },
    },

    {
      $unset: ["__v", "_id", "createdByUser", "updatedByUser"],
    },
  ];
}

module.exports = list;
