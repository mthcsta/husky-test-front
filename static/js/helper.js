// constantes
export const API_BASE_URL = 'http://localhost:8000/api';

// funções
export function putValueOnHiddenInput(datalist, input, callback = () => {}) {
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
export function isKeyboardEvent(event) {
    return 'key' in event.originalEvent;
}
export function queryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}