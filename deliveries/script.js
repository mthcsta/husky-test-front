import language from '../static/js/dataTableTranslate.js';

$(document).ready(function() {
    moment.locale('pt-br');
    $.ajaxSetup({ 
        dataType: "json", 
    });

    const filters = {};

    $("#filter_status").on('change', function() {
        if ($(this).val() == "") {
            delete filters.status;
        } else {
            filters.status = $(this).val();
        }
        $("#deliveriesTable").DataTable().ajax.reload();
    });

    $("#filter_deliveryman").on('change', function() {
        if ($(this).val() == "") {
            delete filters.deliveryman;
        } else {
            filters.deliveryman = $(this).val();
        }
        $("#deliveriesTable").DataTable().ajax.reload();
    });

    $("#filter_date_start").on('change', function() {
        if ($(this).val() == "") {
            delete filters.date_start;
        } else {
            filters.date_start = $(this).val();
        }
        $("#deliveriesTable").DataTable().ajax.reload();
    });

    $("#filter_date_end").on('change', function() {
        if ($(this).val() == "") {
            delete filters.date_end;
        } else {
            filters.date_end = $(this).val();
        }
        $("#deliveriesTable").DataTable().ajax.reload();
    });

    const orders = [
        ['client_id', 0],
        ['deliveryman_id', 0],
        ['status', 0],
        ['collect_point_id', 0],
        ['destination_point_id', 0],
        ['updated_at', 0],
    ];

    $('#deliveriesTable').DataTable({
        processing: true,
        serverSide: true,
        fixedHeader: true,
        ajax: {
            url: apiBaseURL + "/deliveries",
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
                const ordersObject = {[orders[orderColumn][0]]: orderDirection} /*orders.reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});*/
                return { orders: ordersObject, search, offset, limit, filters };
            }
        },
        columns: [
            { 
                data: "client",
                render: function(data, type, row, meta){
                    return $('<a>').html(data.name)
                        .attr('href', `/clients/${data.id}`)
                        .prop('outerHTML');
                }
            },
            { 
                data: "deliveryman",
                render: function(data, type, row, meta){
                    if (!data) {
                        return $('<span>').html('Não informado').prop('outerHTML');
                    }
                    return $('<a>').html(data.name)
                        .attr('href', `/deliveryman/${data.id}`)
                        .prop('outerHTML');
                }
            },
            { 
                data: "status",
                render: function(data, type, val, meta){
                    const statusColor = {
                        novo: 'info',
                        entregando: 'warning',
                        finalizado: 'success',
                        cancelado: 'danger',
                    }
                    return $('<span>').html(data.toUpperCase())
                        .addClass('badge bg-' + statusColor[data.toLowerCase()])
                        .prop('outerHTML');
                }
            },
            { 
                data: "collect_point",
                render: function(data, type, val, meta){
                    return $('<a>').html(data.address)
                        .attr('href', `/point/${data.id}`)
                        .prop('outerHTML');
                }
            },
            { 
                data: "destination_point",
                render: function(data, type, val, meta){
                    return $('<a>').html(data.address)
                        .attr('href', `/point/${data.id}`)
                        .prop('outerHTML');
                }
            },
            { 
                data: "updated_at",
                render: function(data, type, val, meta){
                    return $('<span>').html(moment(data).fromNow())
                        .attr('title', moment(data).format('DD/MM/YYYY HH:mm:ss'))
                        .prop('outerHTML');
                }
            },
            {
                data: "id",
                render: function(data, type, val, meta){
                    const editar = $('<a>').html('Editar')
                        .addClass('btn btn-sm btn-primary open-modal-edit-delivery')
                        .attr('data-id', data)
                        .attr('data-method', 'get')
                        .attr('data-toggle', 'modal')
                        .attr('data-target', '#modalEditDelivery')
                        .prop('outerHTML');
                    const deletar = $('<a>').html('Deletar')
                        .addClass('btn btn-sm btn-danger')
                        .attr('data-id', data)
                        .attr('data-method', 'delete')
                        .attr('data-confirm', 'Você tem certeza que deseja deletar?')
                        .attr('data-toggle', 'modal')
                        .attr('data-target', '#modalDeleteDelivery')
                        .prop('outerHTML');

                    return $('<div>').html(editar + ' ' + deletar)
                        .prop('outerHTML');
                }
            }
        ],
        language
    }).on('draw.dt', function(){
        $("[title]").tooltip();
    });

    

});