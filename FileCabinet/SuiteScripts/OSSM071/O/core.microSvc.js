/**
 * @NApiVersion 2.0
 * @Version 1 [20232.01.11]
 */
define(['./core.date.js', './core.js', './data/rec.search.js', './data/rec.utils.js', 'N/url', 'N/https', 'N/file'],
    function (cored, core, src, recu, url, https, nsFile) {

        const _action = {
            FILE_READ: 'FILE_READ',
            FILE_WRITE: 'FILE_WRITE',
            SVC_START: 'SVC_START'
        }

        function getUrl(params) {
            return url.resolveScript({
                scriptId: 'customscript_ossm_nslink_micorsvc_sl',
                deploymentId: 'customdeploy_ossm_nslink_micorsvc_sl',
                params: params,
            });
        }

        function get(options) {
            var response = https.get({ url: getUrl(options) });
            if (response.code != 200) { throw new Error(response.body); }
            response = JSON.parse(response.body);
            if (response.status != 200) { throw new Error(response.message); }
            return response.content;
        }

        function post(options, payload) {
            var response = https.post({ url: getUrl(options), body: JSON.stringify(payload) });
            if (response.code != 200) { throw new Error(response.body); }
            response = JSON.parse(response.body);
            if (response.status != 200) { throw new Error(response.message); }
            return response.content;
        }



        return {
            Action: _action,

            get: get,
            post: post,

            fileRead: function (fileId) {
                try {
                    return get({ action: _action.FILE_READ, file: fileId });
                } catch (error) {
                    // NOTE: we cannot read file contents from client script which kis extremely annoying for debug
                    //       in addition we cannot use the suitelet from the server side (probably should use a RESTLet but WTF)
                    //       anyway, this is a dirty but very effective and quick solution 
                    //       we read/write via suitelet, if we get this error is because we are running on server so we use the N/file API

                    if (error.message != 'The URL must be a fully qualified HTTPS URL.') { throw error; }

                    var file = nsFile.load(fileId)
                    return {
                        content: {
                            fileId: file.id,
                            fileName: file.name,
                            filePath: file.path,
                            fileType: file.fileType,
                            fileUrl: file.url,
                            size: file.size,
                            folder: file.folder,
                            content: file.getContents(),
                        }
                    }
                }

            },
            fileWrite: function (fileInfo) {
                try {
                    return post({ action: _action.FILE_WRITE }, fileInfo);
                } catch (error) {
                    // NOTE: we cannot read file contents from client script which kis extremely annoying for debug
                    //       in addition we cannot use the suitelet from the server side (probably should use a RESTLet but WTF)
                    //       anyway, this is a dirty but very effective and quick solution 
                    //       we read/write via suitelet, if we get this error is because we are running on server so we use the N/file API

                    if (error.message != 'The URL must be a fully qualified HTTPS URL.') { throw error; }

                    if (isNaN(parseInt(fileInfo.folder))) { fileInfo.folder = src.getSSFolder(fileInfo.folder); }
                    var file = nsFile.create({
                        name: fileInfo.name,
                        fileType: fileInfo.fileType || nsFile.Type.PLAINTEXT,
                        contents: fileInfo.content,
                        encoding: nsFile.Encoding.UTF8,
                        folder: fileInfo.folder,
                        isOnline: fileInfo.isOnline == 'T'
                    });
                    return { fileId: file.save() };
                }
            }

        }
    });
