import { putValueOnHiddenInput, isKeyboardEvent, API_BASE_URL } from '../static/js/helper.js';

$(document).ready(function() {
    // layers usado para marcar pontos no mapa
    let deliveryMap = null;
    let mapCollectPointLayer = null;
    let mapDestinationPointLayer = null;
    let mapDeliverymenLayer = null;

    // FORM CLIENT INPUT: 
    // Evento emitido quando o usuario clicar em algum item da datalist
    $("#form-delivery #clientsDataList").on('change', function(){
        putValueOnHiddenInput.bind(this)('#form-delivery #clientsOptions', '#form-delivery [name="client_id"]');
    });
    // Evento emitido quando o usuario escrever no campo de busca
    $("#form-delivery #clientsDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val(); // pega o valor digitado
        $.ajax({
            url: API_BASE_URL + '/clients',
            data: { search: value }, // busca clientes com o nome digitado
            success: function(response){
                if (response.data.length == 0) {
                    $("#form-delivery #clientsError").removeClass("d-none").show();
                    return
                }
                $("#form-delivery #clientsError").hide();
                const options = response.data.map((client) => {
                    return $('<option>').html(client.name)
                        .attr('value', client.name)
                        .attr('data-value', client.id)
                        .prop('outerHTML');
                }).join('');
                $('#form-delivery #clientsOptions').html(options);
            }
        });
    });

    // FORM COLLECT POINT INPUT:
    // Evento emitido quando o usuario clicar em algum item da datalist
    $("#form-delivery #collectPointDataList").on('change', function(){
        if (!$(this).val()) {
            return mapCollectPointLayer.cleanMarkers();
        }
        putValueOnHiddenInput.bind(this)('#form-delivery #collectPointOptions', '#form-delivery [name="collect_point_id"]', (selector) => {
            const { latitude, longitude } = selector.data();
            mapCollectPointLayer.updateMarker(latitude, longitude);
        });
    });
    // Evento emitido quando o usuario escrever no campo de busca
    $("#form-delivery #collectPointDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val();
        $.ajax({
            url: API_BASE_URL + '/points',
            data: { search: value },
            success: function(response){
                if (response.data.length == 0) {
                    $("#form-delivery #collectPointError").removeClass("d-none").show();
                    return
                }
                $("#form-delivery #collectPointError").hide();
                const options = response.data.map((collectPoint) => {
                    return $("<option>").html(collectPoint.address)
                        .attr('value', collectPoint.address)
                        .attr('data-value', collectPoint.id)
                        .attr('data-latitude', collectPoint.latitude)
                        .attr('data-longitude', collectPoint.longitude)
                        .prop('outerHTML');
                }).join('');
                $('#form-delivery #collectPointOptions').html(options);
            }
        });
    });

    // FORM DESTINATION POINT INPUT:
    // Evento emitido quando o usuario clicar em algum item da datalist
    $("#form-delivery #destinationPointDataList").on('change', function() {
        if (!$(this).val()) {
            return mapDestinationPointLayer.cleanMarkers();
        }
        putValueOnHiddenInput.bind(this)('#form-delivery #destinationPointOptions', '#form-delivery [name="destination_point_id"]', (selector) => {
            const { latitude, longitude } = selector.data();
            mapDestinationPointLayer.updateMarker(latitude, longitude);
        });
    });
    // Evento emitido quando o usuario escrever no campo de busca
    $("#form-delivery #destinationPointDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val();
        $.ajax({
            url: API_BASE_URL + '/points',
            data: { search: value },
            success: function(response){
                if (response.data.length == 0) {
                    $("#form-delivery #destinationPointError").removeClass("d-none").show();
                    return
                }
                $("#form-delivery #destinationPointError").hide();
                const options = response.data.map((destinationPoint) => {
                    return $("<option>").html(destinationPoint.address)
                        .attr('value', destinationPoint.address)
                        .attr('data-value', destinationPoint.id)
                        .attr('data-latitude', destinationPoint.latitude)
                        .attr('data-longitude', destinationPoint.longitude)
                        .prop('outerHTML');
                }).join('');
                $('#form-delivery #destinationPointOptions').html(options);
            }
        });
    });    
    
    // FORM DELIVERYMAN INPUT:
    // Evento emitido quando o usuario clicar em algum item da datalist
    $("#form-delivery #deliverymenDataList").on('change', function() {
        console.log('mmm')
        if (!$(this).val()) {
            return mapDeliverymenLayer.cleanMarkers();
        }
        putValueOnHiddenInput.bind(this)('#form-delivery #deliverymenOptions', '#form-delivery [name="deliveryman_id"]', (selector) => {
            const { latitude, longitude } = selector.data();
            mapDeliverymenLayer.updateMarker(latitude, longitude);
        });
    });
    // Evento emitido quando o usuario escrever no campo de busca
    $("#form-delivery #deliverymenDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val(); // pega o valor digitado
        $.ajax({
            url: API_BASE_URL + '/deliverymen',
            data: { search: value }, // busca clientes com o nome digitado
            success: function(response){
                if (response.data.length == 0) {
                    $("#form-delivery #deliverymenError").removeClass("d-none").show();
                    return
                }
                $("#form-delivery #deliverymenError").hide();
                const options = response.data.map((deliveryman) => {
                    return $('<option>').html(deliveryman.name)
                        .attr('value', deliveryman.name)
                        .attr('data-value', deliveryman.id)
                        .attr('data-latitude', deliveryman.latitude)
                        .attr('data-longitude', deliveryman.longitude)
                        .prop('outerHTML');
                }).join('');
                $('#form-delivery #deliverymenOptions').html(options);
            }
        });
    });

    function onCloseModalAndUpdateDataTable() {
        $('#modalFormDelivery').modal('hide');
        $("#form-delivery").get(0).reset();
        $("#deliveriesTable").DataTable().ajax.reload();
    }

    // FORM DELIVERY SUBMIT:
    $("#form-delivery").on('submit', function(event){
        event.preventDefault();
        const form = $(this);
        const actionType = form.serializeArray().find(({ name }) => name === 'action-type').value;
        const data = form.serialize();

        $(".input-feedback").html('');
        // caso o formulario seja de edicao, chama a api com o metodo PUT
        if (actionType === 'edit') {
            $.ajax({
                url: API_BASE_URL + '/delivery/' + form.find("[name='id']").val(),
                method: 'PUT',
                data: data,
                success: function(response, _, httpResponse){
                    if (httpResponse.status === 200) {
                        onCloseModalAndUpdateDataTable();
                    }
                },
                error: function(data, _, httpResponse) {
                    const response = data.responseJSON;
                    Object.entries(response.errors).forEach(([error, list]) => {
                        $(`#${error}-feedback`).text(list.join(', ')).show();
                    });
                }
            });
        } else if(actionType === 'create') {
            $.ajax({
                url: API_BASE_URL + '/delivery',
                method: 'POST',
                data: data,
                success: function(response, _, httpResponse){
                    if (httpResponse.status === 201) {
                        onCloseModalAndUpdateDataTable();
                    }
                },
                error: function(data, _, httpResponse) {
                    const response = data.responseJSON;
                    Object.entries(response.errors).forEach(([error, list]) => {
                        $(`#${error}-feedback`).text(list.join(', ')).show();
                    });
                }
            });
        }
    });

    // MODAL FORM DELIVERY:
    // Evento emitido quando o modal termina de abrir
    $(document).on('shown.bs.modal', '#modalFormDelivery', function(e) {
        // cria instance para os pontos no mapa
        deliveryMap = DeliveryMap('map');
        mapCollectPointLayer = deliveryMap.createLayer('Ponto de coleta', 'collect');
        mapDestinationPointLayer = deliveryMap.createLayer('Ponto de destino', 'destination');
        mapDeliverymenLayer = deliveryMap.createLayer('Entregador', 'deliveryman');

        // caso seja um formulario de edicao, preenche os campos
        if ($(e.relatedTarget).data('type') === 'edit') {
            // seta o titulo do modal
            $(this).find('#staticBackdropLabel').html('Editar entrega');
            // seta o valor do input de tipo de ação
            $(this).find('#input-action-type').val('edit');


            const deliveryId = $(e.relatedTarget).data('id');
            $.ajax({
                url: API_BASE_URL + '/delivery/' + deliveryId,
                method: 'GET',
                success: function(response){
                    const delivery = response.data;
                    $("#form-delivery [name='id']").val(delivery.id);
                    $("#form-delivery [name='client_id']").val(delivery.client_id);
                    $("#form-delivery #clientsDataList").val(delivery.client.name);
                    $("#form-delivery [name='deliveryman_id']").val(delivery.deliveryman_id);
                    if (delivery.deliveryman) {
                        $("#form-delivery #deliverymenDataList").val(delivery.deliveryman.name);
                        mapDeliverymenLayer.updateMarker(delivery.deliveryman.latitude, delivery.deliveryman.longitude);
                    }
                    $("#form-delivery [name='collect_point_id']").val(delivery.collect_point_id);
                    $("#form-delivery #collectPointDataList").val(delivery.collect_point.address);
                    $("#form-delivery [name='destination_point_id']").val(delivery.destination_point_id);
                    $("#form-delivery #destinationPointDataList").val(delivery.destination_point.address);
                    $("#form-delivery [name='status']").val(delivery.status_index);
                    mapCollectPointLayer.updateMarker(delivery.collect_point.latitude, delivery.collect_point.longitude);
                    mapDestinationPointLayer.updateMarker(delivery.destination_point.latitude, delivery.destination_point.longitude);
                    $.ajax({
                        url: `${API_BASE_URL}/deliverymen-nearby/${delivery.collect_point.latitude}/${delivery.collect_point.longitude}`,
                        method: 'GET',
                        success: function(response){
                            const options = response.data.map((deliveryman) => {
                                return $('<option>').html(deliveryman.name)
                                    .attr('value', deliveryman.name)
                                    .attr('data-value', deliveryman.id)
                                    .attr('data-latitude', deliveryman.latitude)
                                    .attr('data-longitude', deliveryman.longitude)
                                    .prop('outerHTML');
                            }).join('');
                            $('#form-delivery #deliverymenOptions').html(options);        
                        }
                    })
                }
            });    
        } else if ($(e.relatedTarget).data('type') === 'create') {
            // seta o titulo do modal
            $(this).find('#staticBackdropLabel').html('Criar entrega');

            // seta o valor do input de tipo de ação
            $(this).find('#input-action-type').val('create');
        }
    });
    $(document).on('hide.bs.modal', '#modalFormDelivery', function(e) {
        deliveryMap.destroy();
        $("#form-delivery").get(0).reset();
    });

    // MODAL DELETE
    // Evento emitido quando o usuario clicar para deletar uma entrega
    $(document).on('show.bs.modal', '#modalDeleteDelivery', function(e) {
        $(this).find('.btn-ok').attr('data-id', $(e.relatedTarget).data('id'));
    });    
    // Evento emitido quando o usuario clicar confirmar a exclusao de uma entrega
    $(document).on('click', '.btn-ok', '#modalDeleteDelivery', function(){
        const id = $(this).attr('data-id');
        $.ajax({
            url: API_BASE_URL + '/delivery/' + id,
            method: 'DELETE',
            success: (response, _, httpResponse) => {
                if (httpResponse.status === 200) {
                    $('#modalDeleteDelivery').modal('hide');
                    $("#deliveriesTable").DataTable().ajax.reload();
                    $(this).attr('data-id', '');
                }
            }
        });
    });

});
