function stockList(query) {
  return [
    {
      $match: {
        deleted: false,
        ...query,
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouseId",
        foreignField: "id",
        as: "warehouse",
      },
    },
    {
      $addFields: {
        warehouse: {
          $first: "$warehouse.name",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "id",
        as: "createdBy",
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: "$createdBy.name",
        },
        createdById: {
          $first: "$createdBy.id",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "id",
        as: "updatedBy",
      },
    },
    {
      $addFields: {
        updatedBy: {
          $first: "$updatedBy.name",
        },
        updatedById: {
          $first: "$updatedBy.id",
        },
      },
    },
  ];
}

function stockHistoryList(query) {
  return [
    {
      $match: {
        deleted: false,
        ...query,
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "warehouseId",
        foreignField: "id",
        as: "warehouse",
      },
    },
    {
      $addFields: {
        warehouse: {
          $first: "$warehouse.name",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "id",
        as: "createdBy",
      },
    },
    {
      $addFields: {
        createdBy: {
          $first: "$createdBy.name",
        },
        createdById: {
          $first: "$createdBy.id",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "id",
        as: "updatedBy",
      },
    },
    {
      $addFields: {
        updatedBy: {
          $first: "$updatedBy.name",
        },
        updatedById: {
          $first: "$updatedBy.id",
        },
      },
    },
  ];
}

module.exports = { stockList, stockHistoryList };
