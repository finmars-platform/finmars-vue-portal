export default function (cookieService, globalDataService) {

    const iframeMode = window.location.href.indexOf('iframe=true') > -1;

    let getData, setData, deleteData;

    /*if (iframeMode) {

        getData = function (key) {
            console.log("testing.880 requestHeadersService 1");
            const iframeData = globalDataService.getIframeData();

            return iframeData.dataFromParent[key];
        }

        setData = function (key, value) {
            const iframeData = globalDataService.getIframeData();

            iframeData.dataFromParent[key] = value;
        }

        deleteData = function (key) {
            const iframeData = globalDataService.getIframeData();

            delete iframeData.dataFromParent[key];
        }

    } else {
        console.log("testing.880 requestHeadersService 2");
        getData = key => cookieService.getCookie(key);

        setData = function (key, value, options) {
            cookieService.setCookie(key, value, options);
        }

        deleteData = function (key) {
            cookieService.deleteCookie(key);
        }
    }*/
    getData = key => cookieService.getCookie(key);

    setData = function (key, value, options) {
        cookieService.setCookie(key, value, options);
    }

    deleteData = function (key) {
        cookieService.deleteCookie(key);
    }

    return {
        getData: getData,
        setData: setData,
        deleteData: deleteData,
    }
}