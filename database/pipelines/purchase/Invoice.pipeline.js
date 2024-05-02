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
        from: "purchase_orders",
        localField: "purchaseOrderId",
        foreignField: "id",
        as: "po",
      },
    },
    {
      $addFields: {
        po: {
          $first: "$po",
        },
      },
    },
    {
      $lookup: {
        from: "purchase_requests",
        localField: "po.purchaseRequest",
        foreignField: "id",
        as: "pr",
      },
    },
    {
      $addFields: {
        pr: {
          $first: "$pr",
        },
      },
    },
    {
      $lookup: {
        from: "clients",
        localField: "pr.clientId",
        foreignField: "id",
        as: "client",
      },
    },
    {
      $addFields: {
        clientName: {
          $first: "$client.name",
        },
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "pr.projectId",
        foreignField: "id",
        as: "project",
      },
    },
    {
      $addFields: {
        projectName: {
          $first: "$project.name",
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
      $lookup: {
        from: "users",
        localField: "pr.prApprover",
        foreignField: "id",
        as: "prApproverUser",
      },
    },
    {
      $addFields: {
        prApproverName: {
          $first: "$prApproverUser.name",
        },
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "po.vendor",
        foreignField: "id",
        as: "vendorDetails",
      },
    },
    {
      $addFields: {
        vendorName: {
          $first: "$vendorDetails.vendorDisplayName",
        },
        vendorDetails: {
          $first: "$vendorDetails",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "po.poApprover",
        foreignField: "id",
        as: "poApproverObj",
      },
    },
    {
      $addFields: {
        poApproverName: {
          $first: "$poApproverObj.name",
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

function POList(query) {
  return [
    [
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
          from: "purchase_orders",
          localField: "purchaseOrderId",
          foreignField: "id",
          as: "purchaseOrderDetails",
        },
      },
      {
        $unwind: {
          path: "$purchaseOrderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "purchase_requests",
          localField: "purchaseOrderDetails.prId",
          foreignField: "id",
          as: "purchaseRequestDetails",
        },
      },
      {
        $unwind: {
          path: "$purchaseRequestDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      
      
      {
        $lookup: {
          from: "warehouses",
          localField: "purchaseRequestDetails.deliverTo",
          foreignField: "id",
          as: "warehouse",
        },
      },
      {
        $addFields: {
          warehouseName: {
            $first: "$warehouse.name",
          },
        },
      },
      
     
      {
        $lookup: {
          from: "vendors",
          localField: "purchaseOrderDetails.vendorId",
          foreignField: "id",
          as: "vendorDetails",
        },
      },
      {
        $unwind: {
          path: "$vendorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "purchaseOrderDetails.poApproverId",
          foreignField: "id",
          as: "poApproverUser",
        },
      },
      {
        $addFields: {
          poApprover: {
            $first: "$poApproverUser.name",
          },
          poApproverUser: {
            $first: "$poApproverUser",
          },
          
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "id",
          foreignField: "entity",
          as: "messages",
        },
      },

    ],
  ];
}

module.exports = {
  POList,
  list,
};
