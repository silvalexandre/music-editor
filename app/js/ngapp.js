'use strict';

var app = angular.module('myApp', []);
var musicPosition = null;
var songFile = null;

$('.modal-trigger').leanModal();
$(".button-collapse").sideNav();

// $(".openAudio").click(function() {
//     chrome.fileSystem.chooseEntry({
//         type: 'openFile',
//         accepts: [
//             {
//                 description: 'MP3 files (*.mp3)',
//                 extensions: ['mp3']
//             }
//         ]
//     }, function(fileEntry) {
//         if (!fileEntry) {
//             $("#res").html('nada');
//             return;
//         }
//         $("#noFile").hide();
//         $("#fileOpen").show();
//         $("#hasFile").show();
//         fileEntry.file(function(file) {
//             var reader = new FileReader();
//             reader.onload = function(e) {
//                 var scope = $("#fileOpen").scope();
//                 scope.$apply(function() {
//                     scope.play = false;
//                 });
//                 clearTime();
//                 document.getElementById('playMusic').pause();
//                 $("#playMusic").prop('src', e.target.result);
//                 $("#res").html(e.target.result);
//             };
//             reader.readAsDataURL(file);
//         });
//     });
// });

app.controller('musicCtrl', [
    '$scope',
    function($scope, $sce) {
        $scope.play = false;
        $scope.songVol = 10;
        $scope.song = {
            title: 'Musica',
            artist: 'Cantor',
            albumArtist: 'cantor legal',
            album: 'Album',
            year: '2016',
            track: '3',
            genre: 'genero 1',
            lyrics: 'Letra maneira da musica'
        };

        $scope.audioActions = function() {
            if ($scope.play) {
                document.getElementById('playMusic').play();
                musicPosition = setInterval(function() {
                    currentTime()
                }, 1000);
            } else {
                document.getElementById('playMusic').pause();
                clearInterval(musicPosition);
            }
        }
        $scope.changeVol = function(dir) {
            var changeTo = 0;
            $scope.songVol = parseInt($scope.songVol);
            if ($scope.songVol > 0 && $scope.songVol < 10) {
                if (dir === 'up') {
                    $scope.songVol += 1;
                } else if (dir === 'down') {
                    $scope.songVol -= 1;
                }
                changeTo = $scope.songVol / 10;
            } else if ($scope.songVol == 0) {
                if (dir === 'up') {
                    $scope.songVol += 1;
                    changeTo = $scope.songVol / 10;
                } else if (dir === undefined) {
                    changeTo = 0;
                }
            } else if ($scope.songVol) {
                if (dir === 'down') {
                    if ($scope.songVol > 0) {
                        $scope.songVol -= 1;
                        changeTo = $scope.songVol / 10;
                    }
                } else {
                    changeTo = 1;
                }
            }
            document.getElementById('playMusic').volume = changeTo;
        }
        $scope.write = function() {
            // var file = document.getElementById('file');
            // return false;
            var songReader = new FileReader();
            songReader.onload = function() {
                var writer = new ID3Writer(songReader.result);
                writer
                    .setFrame('TIT2', $scope.song['title'])
                    .setFrame('TPE1', $scope.song['artist'].split(','))
                    .setFrame('TPE2', $scope.song['albumArtist'])
                    .setFrame('TALB', $scope.song['album'])
                    .setFrame('TYER', $scope.song['year'])
                    .setFrame('TRCK', $scope.song['track'])
                    .setFrame('TCON', $scope.song['genre'].split(','))
                    .setFrame('USLT', $scope.song['lyrics']);

                if(document.getElementById('cover').files > 0){
                    var coverReader = new FileReader();
                    coverReader.onload = function(){
                        writer.setFrame('APIC', coverReader.result);
                    }
                    coverReader.onerror = function(){
                        console.log('Cover Reader error', coverReader.error);
                    }
                    coverReader.readAsArrayBuffer(document.getElementById('cover').files[0]);
                }
                writer.addTag();
                saveAs(writer.getBlob(), songFile + '_tag.mp3');
            };
            songReader.onerror = function() {
                console.error('Song Reader error', songReader.error);
            };
            songReader.readAsArrayBuffer(document.getElementById('file').files[0]);


        }
    }
]);

function clearTime() {
    $('.curLen3').css('-webkot-transform', 'rotate(0deg)').css('transform', 'rotate(0deg)');
    $('.curLen4').css('-webkot-transform', 'rotate(0deg)').css('transform', 'rotate(0deg)');
    $('.curLen5').css('-webkot-transform', 'rotate(0deg)').css('transform', 'rotate(0deg)');
}

function currentTime() {
    var pm = document.getElementById('playMusic');
    if (pm.ended) {
        clearInterval(musicPosition);
        clearTime();
    } else {
        var end = moment.duration(pm.duration * 1000).format('mm:ss');
        var cur = moment.duration(pm.currentTime * 1000).format('mm:ss');
        var rotate = (pm.currentTime / pm.duration) * 360;
        $('.curLen1').prop('title', cur + ' - ' + end);
        $('.determinate').css('width', (pm.currentTime / pm.duration) * 100 + '%');
        if (rotate < 180) {
            $('.curLen3').css('-webkot-transform', 'rotate(' + rotate + 'deg)').css('transform', 'rotate(' + rotate + 'deg)');
        } else {
            rotate -= 180;
            $('.curLen3').css('-webkot-transform', 'rotate(180deg)').css('transform', 'rotate(180deg)');
            $('.curLen4').css('-webkot-transform', 'rotate(180deg)').css('transform', 'rotate(180deg)');
            $('.curLen5').css('-webkot-transform', 'rotate(' + rotate + 'deg)').css('transform', 'rotate(' + rotate + 'deg)');
        }
    }
}

$("#cover").change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#coverShow').attr('src', e.target.result);
        }
        reader.readAsDataURL(this.files[0]);
    }
});

$("#file").change(function() {
    if (!this.files.length) {
        return;
    }
    var reader = new FileReader();
    var file = this.files[0];
    reader.onload = function(e) {
        $("#noFile").hide();
        $("#fileOpen").show();
        $("#hasFile").show();
        var scope = $("#fileOpen").scope();
        scope.$apply(function() {
            scope.play = false;
        });
        clearTime();
        document.getElementById('playMusic').pause();
        songFile = file.name.split('.')[0];
        $("#playMusic").prop('src', e.target.result);
    };
    reader.onerror = function() {
        console.error('Song Reader Play error', reader.error);
    };
    reader.readAsDataURL(file);
});
// function writeM (arrayBuffer){
//     var writer = new ID3Writer(arrayBuffer);
// writer.setFrame('TIT2', 'Home')
//       .setFrame('TPE1', 'cantor'.split(','))
//       .setFrame('TPE2', 'Eminem')
//       .setFrame('TALB', 'Friday Night Lights')
//       .setFrame('TYER', 2004)
//       .setFrame('TRCK', '6/8')
//       .setFrame('TPOS', '1/2')
//       .setFrame('TCON', 'genero'.split(','))
//       .setFrame('USLT', 'This is unsychronised lyrics')
//     //   .setFrame('APIC', coverArrayBuffer);
// writer.addTag();
//
// // now you can save it to file as you wish
// // var arrayBuffer = writer.arrayBuffer;
// // var blob = writer.getBlob();
// // var url = writer.getURL();
//
// saveAs(writer.getBlob(), 'song with tags.mp3');
// }
