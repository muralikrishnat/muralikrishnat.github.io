var imageGridGame = (function() {
    var images = [{
        title: "Image 1",
        src: "https://picsum.photos/id/772/500/500"
    }, {
        title: "Image 2",
        src: "https://picsum.photos/id/265/500/500"
    },{
        title: "Image 3",
        src: "https://picsum.photos/id/472/500/500"
    },{
        title: "Image 4",
        src: "https://picsum.photos/id/379/500/500"
    },{
        title: "Image 5",
        src: "https://picsum.photos/id/213/500/500"
    },{
        title: "Image 6",
        src: "https://picsum.photos/id/347/500/500"
    }];
    var blankIndex = 8;
    var allowedIndex = [5, 7];
    var gridSize = 0;
    var gridWidth = 0;
    var canMoveInto = [
        [-1, -3, +1, -3, -1],
        [-3, -1, -1, -3, +1],
        [-1, -1, -3, +1, -3],
        [-3, -3, -1, -1, +3],
        [-1, -3, -1, -3, +1]
    ];
    var shuffleMoves = [-1, -3, +1, -3, -1];
    var shuffleImage = function() {
        shuffleMoves = canMoveInto[Math.floor(Math.random() * (canMoveInto.length - 0) + 0)];
    };

    var score = {
        moves: 0,
        time: 0,
        passed: false
    };
    var gameTimer = null;
    var gameTimeLimit = null;
    var timeToShow = new Date();
    var checkScore = function() {
        var isgameDone = true;
        var gridItems = document.querySelectorAll('.grid__item');
        for (var i = 0; i < gridItems.length; i++) {
            var gridItem = gridItems[i];
            if (gridItem.getAttribute('data-index') !== gridItem.getAttribute('data-actual')) {
                isgameDone = false;
                break;
            }
        }
        if (isgameDone) {
            clearInterval(gameTimer);
            clearTimeout(gameTimeLimit);
            score.passed = true;
            gameDone(score);
        }
    };
    var handleClickGridItem = function(skipAnimation) {
        var currentIndex = $(this).attr('data-index') - 0;
        if (allowedIndex.indexOf(currentIndex) >= 0) {
            score.moves += 1;
            $('.grid__item[data-black]').attr('data-index', currentIndex);
            $(this).attr('data-index', blankIndex).animate({
                top: (Math.floor(blankIndex / gridSize) * gridWidth),
                left: (blankIndex % gridSize) * gridWidth
            }, function() {
                $('.grid__item[data-black]').css({
                    top: (Math.floor(currentIndex / gridSize) * gridWidth),
                    left: (currentIndex % gridSize) * gridWidth
                });
            });
            blankIndex = currentIndex;
            allowedIndex = [blankIndex - 1, blankIndex + 1, blankIndex - 3, blankIndex + 3];
            checkScore();
        }
    };
    var E = function() {};
    E.prototype.getStepName = function() {
        return "game";
    };
    E.prototype.startGame = function(noOfMinutes) {
        gridSize = 3;
        var percentage = 100 / (gridSize - 1);
        var imageToRender = images[Math.floor(Math.random() * (images.length - 0) + 0)];
        blankIndex = (gridSize * gridSize) - 1;
        shuffleImage();
        var containerWidth = parseFloat(getComputedStyle(document.querySelector('.game-container'), null).width);
        $('.game-container__bg').css({
            width: '100%',
            height: containerWidth + 'px'
        });
        gridWidth = (containerWidth / 3);
        for (var i = 0; i < gridSize * gridSize; i++) {
            var $gridItem = $('<div/>');
            var xpos = (percentage * (i % gridSize)) + '%';
            var ypos = (percentage * Math.floor(i / gridSize)) + '%';
            $gridItem.addClass('grid__item').addClass('pos-' + i).addClass('vis-hidden');
            $gridItem.attr('data-actual', i);
            $gridItem.attr('data-index', i);
            var bStyles = {
                height: (containerWidth / 3),
                'background-position': xpos + ' ' + ypos,
                'background-size': (gridSize * 100) + '%',
                top: (Math.floor(i / gridSize) * gridWidth),
                left: (i % gridSize) * gridWidth
            };
            if (i < (gridSize * gridSize) - 1) {
                bStyles['backgroundImage'] = 'url("' + imageToRender.src + '")';
            }
            if (i === blankIndex) {
                bStyles['backgroundColor'] = 'rgba(0, 0, 0, .8)';
                $gridItem.append('<div class="grid-mask"></div>');
                $gridItem.attr('data-black', 'true');
            }
            $gridItem.css(bStyles);
            $gridItem.click(handleClickGridItem);
            $('.game-container__bg').append($gridItem);
        }

        shuffleMoves.forEach(function(move) {
            var currentIndex = blankIndex + move;
            if (allowedIndex.indexOf(currentIndex) >= 0) {
                $('[data-index="' + currentIndex + '"]').attr('data-index', blankIndex).css({
                    top: (Math.floor(blankIndex / gridSize) * gridWidth),
                    left: (blankIndex % gridSize) * gridWidth
                });
                $('.grid__item[data-black]').attr('data-index', currentIndex).css({
                    top: (Math.floor(currentIndex / gridSize) * gridWidth),
                    left: (currentIndex % gridSize) * gridWidth
                });
                blankIndex = currentIndex;
                allowedIndex = [blankIndex - 1, blankIndex + 1, blankIndex - 3, blankIndex + 3];
            }
        });
        $('.grid__item').removeClass('vis-hidden');
        timeToShow = new Date();
        timeToShow.setHours(0, noOfMinutes, 0, 0);
        gameTimeLimit = setTimeout(function() {
            clearInterval(gameTimer);
            gameDone(score);
        }, noOfMinutes * 60 * 1000);
        gameTimer = setInterval(function() {
            timeToShow.setSeconds(timeToShow.getSeconds() - 1);
        }, 1000);
    };
    return new E();
})();