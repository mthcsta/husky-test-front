import language from '../static/js/dataTableTranslate.js';


$(document).ready(function() {
    $("#create-points").on('submit', function(e) {
        e.preventDefault();
        const form = $(this);
        const data = form.serialize();
        form.get(0).reset();
        $.ajax({
            url: apiBaseURL + '/points/',
            type: 'POST',
            data: data,
            success: function(data, _, httpResponse) {
                if (httpResponse.status === 201) {
                    $("#pointsTable").DataTable().ajax.reload();
                }
            }
        });
    });

    const orders = [
        ['name', 0],
    ]

    $('#pointsTable').DataTable({
        processing: true,
        serverSide: true,
        fixedHeader: true,
        ajax: {
            url: apiBaseURL + "/points",
            dataSrc: function(response){
                response.recordsTotal = response.meta.total;
                response.recordsFiltered = response.meta.total || 0;
                return response.data;
            },
            data: function(data) {
                const { search: searchValue, start: offset, length: limit, order: orderArray } = data;
                const search = searchValue.value;
                const order = orderArray[0];
                const orderColumn = order.column;
                const orderDirection = order.dir;
                orders[orderColumn][1] = orderDirection;
                const ordersObject = {[orders[orderColumn][0]]: orderDirection}
                return { orders: ordersObject, search, offset, limit };
            }
        },
        columns: [
            { 
                data: "address",
                render: function(data, type, row, meta){
                    return data;
                }
            },
            {
                data: "latitude",

            },
            {
                data: "longitude",
            }
        ],
        language
    }).on('draw.dt', function(){
        $("[title]").tooltip();
    });    


});