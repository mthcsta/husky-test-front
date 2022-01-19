$(document).ready(function() {
    // layers usado para marcar pontos no mapa
    let createDeliveryMap = null;
    let createMapCollectPointLayer = null;
    let createMapDestinationPointLayer = null;
    let editDeliveryMap = null;
    let editMapCollectPointLayer = null;
    let editMapDestinationPointLayer = null;
    let editMapDeliverymenLayer = null;

    function putValueOnHiddenInput(datalist, input, callback = () => {}) {
        const name = $(this).val();
        const selector = $(datalist).find(`option[value="${name}"]`);
        if (!selector) {
            $(this).val('');
            $(input).val('');
            return;
        }
        const id = selector.data('value');
        $(this).blur();
        $(input).val(id);
        callback(selector)
    }
    
    function isKeyboardEvent(event) {
        return 'key' in event.originalEvent;
    }

    $(document).on('shown.bs.modal', '#modalCreateDelivery', function() {
        createDeliveryMap = DeliveryMap('create-map');
        createMapCollectPointLayer = createDeliveryMap.createLayer('Ponto de coleta', 'collect');
        createMapDestinationPointLayer = createDeliveryMap.createLayer('Ponto de destino', 'destination');
    });
    $(document).on('hide.bs.modal', '#modalCreateDelivery', function() {
        createDeliveryMap.destroy();
        $("#create-delivery").get(0).reset();
    })

    // Evento emitido quando o usuario clicar em algum item da datalist
    $("#create-delivery #clientsDataList").on('change', function(){
        putValueOnHiddenInput.bind(this)('#create-delivery #clientsOptions', '#create-delivery [name="client_id"]');
    });

    // Evento emitido quando o usuario escrever no campo de busca
    $("#create-delivery #clientsDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val(); // pega o valor digitado
        $.ajax({
            url: apiBaseURL + '/clients',
            data: { search: value }, // busca clientes com o nome digitado
            success: function(response){
                if (response.data.length == 0) {
                    $("#create-delivery #clientsError").removeClass("d-none").show();
                    return
                }
                $("#create-delivery #clientsError").hide();
                const options = response.data.map((client) => {
                    return $('<option>').html(client.name)
                        .attr('value', client.name)
                        .attr('data-value', client.id)
                        .prop('outerHTML');
                }).join('');
                $('#create-delivery #clientsOptions').html(options);
            }
        });
    });


    $("#create-delivery #collectPointDataList").on('change', function(){
        if (!$(this).val()) {
            return createMapCollectPointLayer.cleanMarkers();
        }
        putValueOnHiddenInput.bind(this)('#create-delivery #collectPointOptions', '#create-delivery [name="collect_point_id"]', (selector) => {
            const { latitude, longitude } = selector.data();
            createMapCollectPointLayer.updateMarker(latitude, longitude);
        });
    });
    $("#create-delivery #collectPointDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val();
        $.ajax({
            url: apiBaseURL + '/points',
            data: { search: value },
            success: function(response){
                if (response.data.length == 0) {
                    $("#create-delivery #collectPointError").removeClass("d-none").show();
                    return
                }
                $("#create-delivery #collectPointError").hide();
                const options = response.data.map((collectPoint) => {
                    return $("<option>").html(collectPoint.address)
                        .attr('value', collectPoint.address)
                        .attr('data-value', collectPoint.id)
                        .attr('data-latitude', collectPoint.latitude)
                        .attr('data-longitude', collectPoint.longitude)
                        .prop('outerHTML');
                }).join('');
                $('#create-delivery #collectPointOptions').html(options);
            }
        });
    });

    $("#create-delivery #destinationPointDataList").on('change', function() {
        if (!$(this).val()) {
            return createMapDestinationPointLayer.cleanMarkers();
        }
        putValueOnHiddenInput.bind(this)('#create-delivery #destinationPointOptions', '#create-delivery [name="destination_point_id"]', (selector) => {
            const { latitude, longitude } = selector.data();
            createMapDestinationPointLayer.updateMarker(latitude, longitude);
        });
    });
    $("#create-delivery #destinationPointDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val();
        $.ajax({
            url: apiBaseURL + '/points',
            data: { search: value },
            success: function(response){
                if (response.data.length == 0) {
                    $("#create-delivery #destinationPointError").removeClass("d-none").show();
                    return
                }
                $("#create-delivery #destinationPointError").hide();
                const options = response.data.map((destinationPoint) => {
                    return $("<option>").html(destinationPoint.address)
                        .attr('value', destinationPoint.address)
                        .attr('data-value', destinationPoint.id)
                        .attr('data-latitude', destinationPoint.latitude)
                        .attr('data-longitude', destinationPoint.longitude)
                        .prop('outerHTML');
                }).join('');
                $('#create-delivery #destinationPointOptions').html(options);
            }
        });
    });    

    $("#create-delivery").on('submit', function(event){
        event.preventDefault();
        const form = $(this);
        const data = form.serialize();
        $.ajax({
            url: apiBaseURL + '/delivery',
            method: 'POST',
            data: data,
            success: function(response, _, httpResponse){
                if (httpResponse.status === 201) {
                    $('#modalCreateDelivery').modal('hide');
                    $("#create-delivery").get(0).reset();
                    $("#deliveriesTable").DataTable().ajax.reload();
                }
            }
        });
    });

    $("#edit-delivery").on('submit', function(event){
        event.preventDefault();
        const form = $(this);
        const data = form.serialize();
        $.ajax({
            url: apiBaseURL + '/delivery/' + form.find("[name='id']").val(),
            method: 'PUT',
            data: data,
            success: function(response, _, httpResponse){
                if (httpResponse.status === 200) {
                    $('#modalEditDelivery').modal('hide');
                    $("#edit-delivery").get(0).reset();
                    $("#deliveriesTable").DataTable().ajax.reload();
                }
            }
        });
    });

    $(".modal-edit-delivery-close").on('click', function(){
        $('#modalEditDelivery').modal('hide');
        $("#edit-delivery").get(0).reset();
    });

    // Evento emitido quando o usuario clicar em algum item da datalist
    $("#edit-delivery #deliverymenDataList").on('change', function() {
        console.log('mmm')
        if (!$(this).val()) {
            return editMapDeliverymenLayer.cleanMarkers();
        }
        putValueOnHiddenInput.bind(this)('#edit-delivery #deliverymenOptions', '#edit-delivery [name="deliveryman_id"]', (selector) => {
            const { latitude, longitude } = selector.data();
            editMapDeliverymenLayer.updateMarker(latitude, longitude);
        });
    });

    // Evento emitido quando o usuario escrever no campo de busca
    $("#edit-delivery #deliverymenDataList").on('keyup', function(event){
        if (!(isKeyboardEvent(event))) { // trava o evento caso nao seja uma tecla
            return;
        }
        const value = $(this).val(); // pega o valor digitado
        $.ajax({
            url: apiBaseURL + '/deliverymen',
            data: { search: value }, // busca clientes com o nome digitado
            success: function(response){
                if (response.data.length == 0) {
                    $("#edit-delivery #deliverymenError").removeClass("d-none").show();
                    return
                }
                $("#edit-delivery #deliverymenError").hide();
                const options = response.data.map((deliveryman) => {
                    return $('<option>').html(deliveryman.name)
                        .attr('value', deliveryman.name)
                        .attr('data-value', deliveryman.id)
                        .attr('data-latitude', deliveryman.latitude)
                        .attr('data-longitude', deliveryman.longitude)
                        .prop('outerHTML');
                }).join('');
                $('#edit-delivery #deliverymenOptions').html(options);
            }
        });
    });

    $(document).on('shown.bs.modal', '#modalEditDelivery', function(e) {
        editDeliveryMap = DeliveryMap('edit-map');
        editMapCollectPointLayer = editDeliveryMap.createLayer('Ponto de coleta', 'collect');
        editMapDestinationPointLayer = editDeliveryMap.createLayer('Ponto de destino', 'destination');
        editMapDeliverymenLayer = editDeliveryMap.createLayer('Entregador', 'deliveryman');
        const deliveryId = $(e.relatedTarget).data('id');
        $.ajax({
            url: apiBaseURL + '/delivery/' + deliveryId,
            method: 'GET',
            success: function(response){
                const record = response.data;
                $("#edit-delivery [name='id']").val(record.id);
                $("#edit-delivery [name='client_id']").val(record.client_id);
                $("#edit-delivery #clientsDataList").val(record.client.name);
                $("#edit-delivery [name='deliveryman_id']").val(record.deliveryman_id);
                if (record.deliveryman) {
                    $("#edit-delivery #deliverymenDataList").val(record.deliveryman.name);
                    editMapDeliverymenLayer.updateMarker(record.deliveryman.latitude, record.deliveryman.longitude);
                }
                $("#edit-delivery [name='collect_point_id']").val(record.collect_point_id);
                $("#edit-delivery #collectPointDataList").val(record.collect_point.address);
                $("#edit-delivery [name='destination_point_id']").val(record.destination_point_id);
                $("#edit-delivery #destinationPointDataList").val(record.destination_point.address);
                $("#edit-delivery [name='status']").val(record.status_index);
                editMapCollectPointLayer.updateMarker(record.collect_point.latitude, record.collect_point.longitude);
                editMapDestinationPointLayer.updateMarker(record.destination_point.latitude, record.destination_point.longitude);
                $.ajax({
                    url: `${apiBaseURL}/deliverymen-nearby/${record.collect_point.latitude}/${record.collect_point.longitude}`,
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
                        $('#edit-delivery #deliverymenOptions').html(options);        
                    }
                })
            }
        });
    });

    $(document).on('hide.bs.modal', '#modalEditDelivery', function(e) {
        editDeliveryMap.destroy();
        $("#edit-delivery").get(0).reset();
    });

    // Evento emitido quando o usuario clicar para deletar uma entrega
    $(document).on('show.bs.modal', '#modalDeleteDelivery', function(e) {
        $(this).find('.btn-ok').attr('data-id', $(e.relatedTarget).data('id'));
    });
    
    // Evento emitido quando o usuario clicar confirmar a exclusao de uma entrega
    $(document).on('click', '.btn-ok', '#modalDeleteDelivery', function(){
        const id = $(this).attr('data-id');
        $.ajax({
            url: apiBaseURL + '/delivery/' + id,
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
