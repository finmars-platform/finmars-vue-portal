/**
 * Created by mevstratov on 18.05.2021
 */

'use strict'

export default function ($state, commonDialogsService) {
    return {
        restrict: 'A',
        scope: {
            dndElem: '=', // HTMLElem
            dndElemString: '@', // parameter for querySelector

            isDisabled: '=',
        },
        link: function (scope, elem, attrs) {
            let elementForDropping = elem[0]

            if (scope.dndElem) {
                /*if (typeof scope.dndElem === 'string') { // if scope.dndElem selectors for querySelector()
                    elementForDropping = document.querySelector(scope.dndElem);

                } else { // if scope.dndElem HTMLElem
                    elementForDropping = scope.dndElem;
                }*/
                elementForDropping = scope.dndElem
            } else if (scope.dndElemString) {
                elementForDropping = document.querySelector(scope.dndElemString)
            }

            const openImportConfigurationManager = function (fileToRead) {
                const reader = new FileReader()

                reader.readAsText(fileToRead)

                reader.onload = function (evt) {
                    try {
                        const file = JSON.parse(evt.target.result)

                        /* $mdDialog.show({
                            controller: 'ConfigurationImportDialogController as vm',
                            templateUrl: '@/angularrtal/scripts/app/views/dialogs/configuration-import/configuration-import-dialog-view.html',
                            //controller: 'SettingGeneralConfigurationPreviewFileDialogController as vm',
                            //templateUrl: 'views/dialogs/settings-general-configuration-preview-file-dialog-view.html',
                            parent: angular.element(document.body),
                            preserveScope: true,
                            autoWrap: true,
                            skipHide: true,
                            locals: {
                                data: {
                                    file: file,
                                    rawFile: fileToRead
                                }
                            }

                        }).then(function (res) {

                            if (res.status === 'agree') $state.reload();

                        }); */

                        const icmLocals = {
                            data: {
                                file: file,
                                rawFile: fileToRead,
                            },
                        }

                        commonDialogsService.importConfigurationManager(icmLocals)
                    } catch (error) {
                        console.error(error)
                        /* $mdDialog.show({
                            controller: 'WarningDialogController as vm',
                            templateUrl: 'views/dialogs/warning-dialog-view.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose: false,
                            locals: {
                                warning: {
                                    title: 'Error',
                                    description: 'Unable to read it. This file is corrupted.'
                                }
                            },
                            preserveScope: true,
                            autoWrap: true,
                            skipHide: true
                        }); */
                        const warningLocals = {
                            warning: {
                                title: 'Error',
                                description: 'Unable to read it. This file is corrupted.',
                            },
                        }

                        commonDialogsService.warning(warningLocals)
                    }
                }
            }

            const preventDefaultCallback = function (ev) {
                ev.preventDefault()
            }

            const importOnDragListeners = function () {
                let dragBackdropElem = document.createElement('div')
                dragBackdropElem.classList.add('drag-file-backdrop')
                dragBackdropElem.appendChild(document.createElement('div'))

                let dragBackdropTextHolder = dragBackdropElem.querySelector('div')
                dragBackdropTextHolder.appendChild(
                    document.createElement('span')
                ).textContent = 'Drop File Here'

                elementForDropping.addEventListener('dragenter', function (ev) {
                    ev.preventDefault()

                    if (ev.dataTransfer.items && ev.dataTransfer.items.length === 1) {
                        if (ev.dataTransfer.items[0].kind === 'file') {
                            if (!elementForDropping.contains(dragBackdropElem))
                                elementForDropping.appendChild(dragBackdropElem)
                        }
                    }
                })

                window.addEventListener('dragover', preventDefaultCallback, false)

                dragBackdropElem.addEventListener('dragleave', function (ev) {
                    ev.preventDefault()
                    if (ev.target === dragBackdropElem)
                        elementForDropping.removeChild(dragBackdropElem)
                })

                dragBackdropElem.addEventListener('drop', function (ev) {
                    ev.preventDefault()
                    ev.stopPropagation()

                    if (ev.dataTransfer.items && ev.dataTransfer.items.length === 1) {
                        if (ev.dataTransfer.items[0].kind === 'file') {
                            const file = ev.dataTransfer.items[0].getAsFile()

                            const fileNameParts = file.name.split('.')
                            const fileExtension = fileNameParts.pop()

                            if (fileExtension !== 'fcfg') {
                                /* $mdDialog.show({
                                    controller: 'WarningDialogController as vm',
                                    templateUrl: 'views/dialogs/warning-dialog-view.html',
                                    parent: angular.element(document.body),
                                    targetEvent: ev,
                                    clickOutsideToClose: false,
                                    locals: {
                                        warning: {
                                            title: 'Warning',
                                            description: "Wrong file extension. Drop configuration file to start import."
                                        }
                                    },
                                    autoWrap: true,
                                    multiple: true
                                }) */

                                const warningLocals = {
                                    warning: {
                                        title: 'Warning',
                                        description:
                                            'Wrong file extension. Drop configuration file to start import.',
                                    },
                                }

                                commonDialogsService.warning(warningLocals, { targetEvent: ev })
                            } else {
                                openImportConfigurationManager(file)
                            }
                        }
                    }

                    elementForDropping.removeChild(dragBackdropElem)
                })
            }

            if (!scope.isDisabled) {
                importOnDragListeners()
            }

            scope.$on('$destroy', function () {
                window.removeEventListener('dragover', preventDefaultCallback, false)
            })
        },
    }
}
