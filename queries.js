//se precisa del numero de ventas realizadas por cada vendedor
db.ventas.aggregate([
  {
    $group: {
      _id: "$seller",
      numberOfSale: {
        $count: {},
      }
    }
  },
  {
      $sort:{
          numberOfSale:-1
      }
  }
])

//Se precisa una media del dinero generado por cada vendedor
db.ventas.aggregate([
  {
    $unwind: {
      path: "$item",
    },
  },
  {
    $group: {
      _id: "$seller",
      averageSeller: {
        $avg: {
          $multiply: ["$item.soldPrice", "$item.soldUnits"],
        },
      },
    },
  },
])

//Se necesita conocer los beneficios netos realizados por cada vendedor
db.ventas.aggregate([
  {
    $unwind: {
      path: "$item",
    },
  },
  {
    $project: {
      seller: 1,
      netIncome: {
        $subtract: [
          {
            $multiply: [
                "$item.soldPrice",
                "$item.soldUnits"
            ],
          },
          {
            $multiply: [
                "$item.companyPrice",
                "$item.soldUnits"
            ],
          },
        ],
      },
    },
  },
  {
    $group: {
      _id: "$seller",
      total: {
        $sum: "$netIncome",
      },
    },
  },
]);


//Se precisa de una lista con el numero de articulos comprados por los diferentes clientes ordenada de mayor a menor
db.ventas.aggregate([
    {
        $unwind:{
            path:"$item"
        }
    },
    {
        $group:{
            _id:"$client",
            soldUnits:{
                $sum:"$item.soldUnits"
            }
        }
    },
    {
        $sort:{
            soldUnits:-1
        }
    }
])


//se precisa de una lista de los ingresos netos por mes ordenados de mayor a menor
db.ventas.aggregate([
    {
        $unwind:{
            path:"$item"
        }
    },
    {
        $project:{
            month:{
                $month:"$dateOfSale"
            },
            netIncome:{
                $subtract: [
                    {
                      $multiply: [
                          "$item.soldPrice",
                          "$item.soldUnits"
                      ],
                    },
                    {
                      $multiply: [
                          "$item.companyPrice",
                          "$item.soldUnits"
                      ],
                    },
                  ]
            }
        },   
    },
    {
        $group:{
            _id:"$month",
            avg:{
                $avg:"$netIncome" 
            }
        }
    },
    {
        $project:{
            month:"$_id",
            avgNetIncome:{
                $round:[
                    "$avg",
                    2
                ]
            },
            _id:0
        }
    },
    {
        $sort:{
            avgNetIncome:-1
        }
        
    }
])