export default function queryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}