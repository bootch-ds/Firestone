
app.directive('autofocus', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element) {
            $timeout(function () {
                $element[0].focus();
            }, 200);

            $element.on('focus', function () {
                var self = this;
                $timeout(function () {
                    self.select();
                }, 10);
            });
        }
    };
}]);

app.directive('scrollchecker', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            $timeout(function () {
                scope.$evalAsync(function () { ScrollCheck(); });
            });
        }
    };
}]);

app.directive('dayofmonth', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element) {
            $timeout(function () {
                $element[0].focus();
            }, 200);

            $element.on('focus', function () {
                var self = this;
                $timeout(function () {
                    self.select();
                }, 10);
            });
        }
    };
}]);

app.directive("fileDropzone", function ($timeout) {
    return {
        restrict: "A",
        scope: {
            callback: '=myCallback',
            fileName: '=myFilename',
            fileContents: '=myFile'
        },
        link: function (scope, element, attrs) {
            var validMimeTypes = attrs.fileDropzone;

            var processDragOverOrEnter = function (event) {
                if (event !== null) {
                    event.preventDefault();
                }
            };
            var checkSize = function (size) {
                var _ref;
                if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
                    return true;
                } else {
                    alert("File must be smaller than " + attrs.maxFileSize + " MB");
                    return false;
                }
            };
            var isTypeValid = function (type) {
                if (validMimeTypes === (void 0) || validMimeTypes === '' || ValidateMimeType(type, validMimeTypes)) {
                    return true;
                } else {
                    alert("Invalid file type.  File must be one of following types " + validMimeTypes);
                    return false;
                }
            };

            element.bind('dragover', processDragOverOrEnter);
            element.bind('dragenter', processDragOverOrEnter);

            return element.bind('drop', function (event) {
                var file, name, reader, size, type;
                if (event !== null) {
                    event.preventDefault();
                }

                reader = new FileReader();
                reader.onload = function (evt) {
                    if (checkSize(size) && isTypeValid(type)) {
                        scope.$apply(function () {
                            var x = evt.target.result;
                            scope.fileContents = evt.target.result;
                            if (angular.isString(scope.fileName)) {
                                scope.fileName = name;
                            }
                        });
                        $timeout(scope.callback(), 500);
                        return;
                    }
                };

                if (event.dataTransfer) {
                    file = event.dataTransfer.files[0];
                    //scope.fileName = scope.file.name;
                    //$timeout(scope.callback(), 500);
                }
                else if (event.originalEvent.dataTransfer) {
                    file = event.originalEvent.dataTransfer.files[0];
                    //scope.fileName = scope.file.name;
                    //$timeout(scope.callback(), 500);
                }
                else {
                    return false;
                }

                name = file.name;
                type = file.type;
                size = file.size;
                reader.readAsText(file);
                return false;
            });
        }
    };
});