import language from '../static/js/dataTableTranslate.js';
import { queryParam, API_BASE_URL } from '../static/js/helper.js';

$.ajaxSetup({
    headers: {
        accept: 'application/json'
    }
});

$(document).ready(function() {
    $("#create-deliverymen").on('submit', function(e) {
        e.preventDefault();
        const form = $(this);
        const data = form.serialize();
        $(".input-feedback").html('');
        $.ajax({
            url: API_BASE_URL + '/deliveryman/',
            type: 'POST',
            data: data,
            success: function(data, _, httpResponse) {
                if (httpResponse.status === 201) {
                    $("#deliverymenTable").DataTable().ajax.reload();
                    form.get(0).reset();
                }
            },
            error: function(data, _, httpResponse) {
                const response = data.responseJSON;
                Object.entries(response.errors).forEach(([error, list]) => {
                    $(`#${error}-feedback`).text(list.join(', ')).show();
                });
            }
        });
    });

    const orders = [
        ['name', 0],
    ]

    const datatable = $('#deliverymenTable').DataTable({
        processing: true,
        serverSide: true,
        fixedHeader: true,
        ajax: {
            url: API_BASE_URL + "/deliverymen",
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
                data: "name",
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

    const query = queryParam('q');
    if (query) {
        datatable.search(query).draw();
    }

});