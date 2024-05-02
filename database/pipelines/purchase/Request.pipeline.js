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
        from: "manufactures",
        localField: "items.manufacturerId",
        foreignField: "id",
        as: "manufacturers",
      },
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "item",
            in: {
              quantity: "$$item.quantity",
              ipn: "$$item.ipn",
              manufacturerId: "$$item.manufacturerId",
              mpn: "$$item.mpn",
              shortDescription: "$$item.shortDescription",
              status: "$$item.status",
              rfq: "$$item.rfq",
              orderedQuantity: "$$item.orderedQuantity",
              _id: "$$item._id",
              manufacturer: {
                $let: {
                  vars: {
                    manufacturerDoc: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$manufacturers",
                            cond: {
                              $eq: ["$$this.id", "$$item.manufacturerId"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$manufacturerDoc.name",
                },
              },
            },
          },
        },
      },
    },
    ...require("../utils/items.pipeline"),
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
        clientName: { $first: "$client.name" },
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "id",
        as: "project",
      },
    },
    {
      $addFields: {
        projectName: { $first: "$project.name" },
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "deliverTo",
        foreignField: "id",
        as: "warehouse",
      },
    },
    {
      $addFields: {
        warehouseName: { $first: "$warehouse.name" },
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
        createdByName: { $first: "$createdByUser.name" },
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
        updatedByName: { $first: "$updatedByUser.name" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "prApprover",
        foreignField: "id",
        as: "prApproverUser",
      },
    },
    {
      $addFields: {
        prApproverName: { $first: "$prApproverUser.name" },
      },
    },
    {
      $lookup: {
        from: "indentors",
        localField: "indentorId",
        foreignField: "id",
        as: "indentor",
      },
    },
    {
      $addFields: {
        indentor: { $first: "$indentor.name" },
      },
    },
    {
      ...require("../message.pipeline"),
    },
    {
      $unset: [
        "__v",
        "_id",
        "createdByUser",
        "updatedByUser",
        "client",
        "project",
        "prApproverUser",
      ],
    },
  ];
}

module.exports = list;
