import language from '../static/js/dataTableTranslate.js';
import { API_BASE_URL } from '../static/js/helper.js';

$(document).ready(function() {
    moment.locale('pt-br');
    $.ajaxSetup({ 
        dataType: "json", 
        headers: {
            accept: 'application/json'
        }    
    });
    
    const filters = {};
    const orders = [
        ['client_id', 0],
        ['deliveryman_id', 0],
        ['status', 0],
        ['collect_point_id', 0],
        ['destination_point_id', 0],
        ['updated_at', 0],
    ];

    // Eventos de filtro
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

    // datatable
    $('#deliveriesTable').DataTable({
        processing: true,
        serverSide: true,
        fixedHeader: true,
        searching: false,
        order: [ [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0] ], // ordenação inicial
        columnDefs: [
            { orderSequence: [ '0', "asc", "desc" ], targets: [ 0, 1, 2, 3, 4, 5 ] }, // tipos de ordenações para cada coluna
            { orderable: false, targets: [ 6 ] } // desativa ordenação para a ultima coluna pois é o botão de ação
        ],
        stateSave: true,
        ajax: {
            url: API_BASE_URL + "/deliveries",
            dataSrc: function(response){
                response.recordsTotal = response.meta.total;
                response.recordsFiltered = response.meta.total || 0;
                return response.data;
            },
            data: function(data) {
                const { start: offset, length: limit, order: orderArray } = data;
                const order = orderArray[0];
                const orderColumn = order.column;
                const orderDirection = order.dir;
                orders[orderColumn][1] = orderDirection;
                /*const ordersObject = {[orders[orderColumn][0]]: orderDirection} */
                const ordersObject = orders.reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});
                return { orders: ordersObject, offset, limit, filters };
            }
        },
        columns: [
            { 
                data: "client",
                render: function(data, type, row, meta){
                    return $('<a>').html(data.name)
                        .attr('href', `/clients/?q=${data.name}`)
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
                        .attr('href', `/deliverymen/?q=${data.name}`)
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
                        .attr('href', `/points/?q=${data.address}`)
                        .prop('outerHTML');
                }
            },
            { 
                data: "destination_point",
                render: function(data, type, val, meta){
                    return $('<a>').html(data.address)
                        .attr('href', `/points/?q=${data.address}`)
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
                        .attr('data-type', 'edit')
                        .attr('data-target', '#modalFormDelivery')
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
    }).on('order.dt', function(e, settings, data) {
        console.log(e)
        console.log(settings)
        console.log(data)
        $(e.currentTarget.tHead.rows[0].cells).each(function(index, row){
            if ($(this).hasClass('sorting_disabled')) {
                return;
            }
            if (orders[index][1] == '0') {
                $(this).addClass('no-sort');
                $(this).removeClass('sorting_asc sorting_desc');
            } else if (orders[index][1] == 'asc') {
                $(this).addClass('sorting_asc');
                $(this).removeClass('sorting_desc no-sort');
            } else if (orders[index][1] == 'desc') {
                $(this).addClass('sorting_desc');
                $(this).removeClass('sorting_asc no-sort');
            }
        });
    });

});