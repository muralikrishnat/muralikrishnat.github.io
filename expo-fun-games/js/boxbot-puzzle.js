var boxBotPuzzle = (function() {
    // BoxBot
    //
    // Copyright (c) 2014 Gabor Bata
    //
    // Permission is hereby granted, free of charge, to any person
    // obtaining a copy of this software and associated documentation files
    // (the "Software"), to deal in the Software without restriction,
    // including without limitation the rights to use, copy, modify, merge,
    // publish, distribute, sublicense, and/or sell copies of the Software,
    // and to permit persons to whom the Software is furnished to do so,
    // subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be
    // included in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    // EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
    // BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
    // ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    // CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.

    var OUTER_FLOOR = 0;
    var FLOOR = 1;
    var GOAL = 2;
    var PLAYER = 4;
    var BOX = 5;
    var BOX_ON_GOAL = 6;
    var PLAYER_SHADOW = 7;
    var SHADOW = 8;
    var SHADOW_SHIFT = 4;
    var TABLE_WIDTH = 14;
    var TABLE_HEIGHT = 12;
    var IMAGE_SCALE = 2;
    var IMAGE_SIZE = 16;
    var BLOCK_SIZE = IMAGE_SIZE * IMAGE_SCALE;

    var LEVEL_DATA = decompress(
        'uu~vpY,j-#WWPF!"=R`wN%$:&hb;mv`jwNkV&JNT8NwsSpjjYt$wEkbZ"Vdfg"#9NTbhkDYR oGCP"&&%$nC=xYd pDb"I":x:FDY0pD8sl"Bt#2EkNkbhws0wpai7w!HCn6"2a' +
        '%twy;0pgxGCPU#kLxkspTY0fcottwOxeq!/lWt/1hl/pT-xYSfprp$%Z4&lcl%hAoxYMpjpX3X$%kaxwbhjYSobx"EJ8#Q!xbkTsl5S fnplnJ&q!HexaTx>dpYJ$jwEqEhNwsd' +
        'voQlXktHtxhPZtL%JkaFwa0ow@"Xp"L!lnxtknxT%Hxx>mOpDori#2ciI"4w!%"co;Mos tTwXlL%"&tne"&qPx_iVz~ `Y#%$YJ%wQ"WH1lAC!co;z~pjw:Fbh#9Q"W7"tXl@#' +
        'QxYz~K_6xpOtkeq/x"$3/wkeprthh>R`-x"&hPkk$nlG#d owahh"yltaxkE9N$gd`5l#X$%kXtta"3>d pY1D#7W@!Q%t5"2gSf>%tHx%$kPin#UhBMwp8N"%wpOw&"Wqc#2%l' +
        'c6-ROoB!3ne&%tP#F!nxhBRKBUU$Axk#k4Wk4#lcwpRvpyo!$<%kXhkQ"h5doG1$ZPkWL&#&_i!@!<pySowX3<%U>%&_eF!nC=dpD8#XtU7I$Qtts x"gd oQl7I$aUh#@VdKbl' +
        ':FQ!k#7&!:,N"5S`spk#<Wa$#&hHx&ZLiVz~vo>Fahk"<kHwtB!W@!aZwaS`#g$hgU9Ek8Vd`BtZn#$IWnl,npZ5dpjjpXU&!L!ITnlG;mOfw<"kprw!"tkP"e$LZk<pymv`-iT' +
        'A1&"%&!c6#Wn#lwadvGoxnlU%Ae$tkcw%"3nx6=Mfs t#9QUTX&"kXe#@VmvwY JoaUZXttprl%k$cwx%kQ;mKGxw!"c#lW49k"cl#TA,6=dfbl_eIkPU"hL!TwaMoGJh$UnxIk' +
        '=!orC!ci!k4oAouu|,#h|-w_|/#O|0mr|1t"|2$"|3Z!|4cx|5#b|6#x|7ye|8si|9%#|:st|;lg|<yx|=no|>yp|@yi|Awr|B_w|Ciq|DVx|Ese|F$q|Go~|Hw~|I%%|J#"|K ' +
        ' o|Lnw|MS~r|Nsx|Ov |Pnt|Qyw|Rd~~|Sm~|T$!|U""|Vsw|W%q|Xyt|Yyv|Z"q|_p~|` pj|ay#|bs#|c#r|dmu|et%|fos l|gs #|h"!|ixq|jyvx|k%!|lx!|mzu|n#~|o' +
        'ww|pw#|q!!|rv  |sy |t#!|u~~~|v   |w##|x#!!|y#~ |z####~~~~~~~|~      ');

    var IMAGE_DATA = decompress(
        '~jynttnyynhnyynivtumtumthomthomouhliol~trntrtv ytjtlz"rz"lllwouoywrujpggggssssp"ll~wouoywrujp"v uy ffxiel!v uuyyvelkffxi uyl~uy!jky!vdk' +
        'dvoyr"!vzq ize~w!jy qykd!r"qyrd~"qqq"!roq!rzkzq z"rze~wukqy!v"!royvokz!vz zriz |d"y|e !|fxx|g"~|h!z|izz|jry|k! |l~~|mtt~ |nt~v|o""|pzzz' +
        'zz"|q!~"|r  |swwwwww|t!"|uyyy|v~~ |w" y|xzz !~~! |y!!|z"""|~   ');

    var IMAGE_INDEX = 3;
    var IMAGE_PALETTE = [
        // floor: outer
        ['rgba(33, 40, 92, 1)', 'rgba(25, 32, 76, 1)', 'rgba(48, 51, 120, 1)', 2],
        // floor: inner
        ['rgba(92, 60, 32, 1)', 'rgba(76, 48, 24, 1)', 'rgba(120, 88, 48, 1)', 2],
        // floor: goal
        ['rgba(116, 6, 12, 1)', 'rgba(100, 3, 5, 1)', 'rgba(142, 22, 24, 1)', 2],
        // wall
        ['rgba(162, 155, 121, 1)', 'rgba(206, 196, 145, 1)', 'rgba(127, 117, 67, 1)', 3],
        // player
        ['rgba(0 ,0 ,0 ,0)', 'rgba(192, 192, 192, 1)', 'rgba(128, 128, 128, 1)', 0],
        // box
        ['rgba(196 ,168 ,100 ,1)', 'rgba(168, 132, 72, 1)', 'rgba(111, 78, 42, 1)', 1],
        // box on goal
        ['rgba(196, 120, 101, 1)', 'rgba(168, 84, 73, 1)', 'rgba(111, 44, 43, 1)', 1],
        // player shadow
        ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.3)', 0],
        // shadow
        ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.3)', 1]
    ];

    var STATUS_TEXT = 'LEVEL: %s     MOVES: %s     PUSHES: %s';
    var COMPLETED_TEXT = 'LEVEL COMPLETED! PRESS ENTER TO CONTINUE.';

    var GAME_TITLE = 'BOXBOT';
    var GAME_CONTROLS = 'GAME CONTROLS:';
    var GAME_CONTROL_ARROWS = 'ARROW KEYS - MOVE';
    var GAME_CONTROL_RESTART = 'BACKSPACE - RESTART LEVEL';
    var GAME_CONTROL_LEVEL = 'PGUP/PGDN - NEXT/PREVIOUS LEVEL';
    var GAME_CONTROL_START = 'PRESS ANY KEY TO START.';
    var GAME_COPYRIGHT = '(C) 2014 GABOR BATA';

    var LEVEL_NUM = 50;

    var CENTER = TABLE_WIDTH * BLOCK_SIZE / 2;
    var LETTER_SPACING = 19;
    var FONT = 'bold 14px sans-serif';
    var FONT_COLOR = 'rgba(255, 255, 255, 0.4)';
    var TEXT_ALIGN = 'center';

    var COMMAND_UP = 'up';
    var COMMAND_DOWN = 'down';
    var COMMAND_LEFT = 'left';
    var COMMAND_RIGHT = 'right';
    var COMMAND_NEXT = 'next';
    var COMMAND_PREV = 'prev';
    var COMMAND_RESET = 'reset';
    var COMMAND_CONTINUE = 'continue';

    var images;
    var table;
    var context;
    var moves;
    var pushes;
    var levelSolved;
    var level;
    var playerPos;
    var gameStarted;
    var keyPress;

    function sprintf(format) {
        for (var i = 1; i < arguments.length; i++) {
            format = format.replace(/%s/, arguments[i]);
        }
        return format;
    }

    function decompress(k) {
        var i, x = k.split("|"),
            y = x.shift();
        for (i = 0; i < x.length; i++) {
            y = y.replace(new RegExp(x[i].charAt(0), 'g'), x[i].substring(1));
        }
        return y;
    }

    function getData(input, index, output) {
        var counter = 0;
        while (counter < output.length) {
            output[counter] = input.charCodeAt(index * output.length + counter) - 0x20;
            counter++;
        }
    }

    function generateImages() {
        var images = new Array(IMAGE_PALETTE.length); // 9
        var imageData = new Array(IMAGE_SIZE * IMAGE_SIZE);
        for (var i = 0; i < images.length; i++) {
            getData(IMAGE_DATA, IMAGE_PALETTE[i][IMAGE_INDEX], imageData);
            var image = document.createElement('canvas');
            image.width = BLOCK_SIZE;
            image.height = BLOCK_SIZE;
            var imageContext = image.getContext('2d');
            imageContext.clearRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
            for (var x = 0; x < IMAGE_SIZE; x++) {
                for (var y = 0; y < IMAGE_SIZE; y++) {
                    imageContext.fillStyle = IMAGE_PALETTE[i][imageData[IMAGE_SIZE * y + x]];
                    imageContext.fillRect(x * IMAGE_SCALE, y * IMAGE_SCALE, IMAGE_SCALE, IMAGE_SCALE);
                }
            }
            images[i] = image;
        }
        return images;
    }

    function loadLevel() {
        if (level < 0) {
            level = LEVEL_NUM - 1;
        } else if (level > LEVEL_NUM - 1) {
            level = 0;
        }
        moves = 0;
        pushes = 0;
        levelSolved = false;
        getData(LEVEL_DATA, level, table);
        for (var x = 0; x < TABLE_WIDTH; x++) {
            for (var y = 0; y < TABLE_HEIGHT; y++) {
                if (table[TABLE_WIDTH * y + x] == PLAYER) {
                    table[TABLE_WIDTH * y + x] = FLOOR;
                    playerPos.x = x;
                    playerPos.y = y;
                }
            }
        }
    }

    function paint() {
        for (var i = 0; i < 3; i++) { // 3 step: draw floor, draw shadows, draw other elements
            for (var x = 0; x < TABLE_WIDTH; x++) {
                for (var y = 0; y < TABLE_HEIGHT; y++) {
                    if (!gameStarted) {
                        context.drawImage(images[OUTER_FLOOR], x * BLOCK_SIZE, y * BLOCK_SIZE);
                    } else if (i == 0 && table[TABLE_WIDTH * y + x] <= 2) { // draw floor
                        context.drawImage(images[table[TABLE_WIDTH * y + x]], x * BLOCK_SIZE, y * BLOCK_SIZE);
                    } else if (i == 1 && table[TABLE_WIDTH * y + x] > 2) { //draw shadow
                        context.drawImage(images[SHADOW], x * BLOCK_SIZE + SHADOW_SHIFT, y * BLOCK_SIZE + SHADOW_SHIFT);
                    } else if (i == 2 && table[TABLE_WIDTH * y + x] > 2) { //draw other
                        context.drawImage(images[table[TABLE_WIDTH * y + x]], x * BLOCK_SIZE, y * BLOCK_SIZE);
                    }
                }
            }
            if (i == 1 && gameStarted) { // draw player shadow
                context.drawImage(images[PLAYER_SHADOW], playerPos.x * BLOCK_SIZE + SHADOW_SHIFT, playerPos.y * BLOCK_SIZE + SHADOW_SHIFT);
            } else if (i == 2 && gameStarted) { // draw player
                context.drawImage(images[PLAYER], playerPos.x * BLOCK_SIZE, playerPos.y * BLOCK_SIZE);
            }
        }

        // draw text
        context.font = FONT;
        context.fillStyle = FONT_COLOR;
        context.textAlign = TEXT_ALIGN;
        if (!gameStarted) {
            var shift = (TABLE_HEIGHT * BLOCK_SIZE - LETTER_SPACING * 9) / 2;
            context.fillText(GAME_TITLE, CENTER, LETTER_SPACING + shift);
            context.fillText(GAME_CONTROLS, CENTER, LETTER_SPACING * 3 + shift);
            context.fillText(GAME_CONTROL_ARROWS, CENTER, LETTER_SPACING * 4 + shift);
            context.fillText(GAME_CONTROL_RESTART, CENTER, LETTER_SPACING * 5 + shift);
            context.fillText(GAME_CONTROL_LEVEL, CENTER, LETTER_SPACING * 6 + shift);
            context.fillText(GAME_CONTROL_START, CENTER, LETTER_SPACING * 8 + shift);
            context.fillText(GAME_COPYRIGHT, CENTER, TABLE_HEIGHT * BLOCK_SIZE - BLOCK_SIZE / 4);
        } else {
            if (levelSolved) {
                context.fillText(COMPLETED_TEXT, CENTER, LETTER_SPACING);
                gameDone({
                    passed: true
                });
            }
            var text = sprintf(STATUS_TEXT, (level + 1), moves, pushes);
            context.fillText(text, CENTER, TABLE_HEIGHT * BLOCK_SIZE - BLOCK_SIZE / 4);
        }
    }

    function handleButtonClick(event) {
        handleCommand(event.target.id);
    }

    function handleKeyReleased() {
        keyPress = false;
    }

    function handleKeyPressed(event) {
        if (!keyPress) {
            keyPress = true;
            var command = '';
            switch (event.keyCode) {
                case 38: // up
                    command = COMMAND_UP;
                    break;
                case 40: // down
                    command = COMMAND_DOWN;
                    break;
                case 37: // left
                    command = COMMAND_LEFT;
                    break;
                case 39: // right
                    command = COMMAND_RIGHT;
                    break;
                case 33: // page up
                    command = COMMAND_NEXT;
                    break;
                case 34: // page down
                    command = COMMAND_PREV;
                    break;
                case 8: // backspace
                    command = COMMAND_RESET;
                    break;
                case 13: // enter
                    command = COMMAND_CONTINUE;
                    break;
                default:
                    if (gameStarted) {
                        return;
                    }
            }
            event.preventDefault();
            if (command != '' || !gameStarted) {
                handleCommand(command);
            }
        }
    }

    function handleCommand(command) {
        if (gameStarted) {
            var direction = {
                x: 0,
                y: 0
            };
            switch (command) {
                case COMMAND_UP:
                    direction.y = -1;
                    break;
                case COMMAND_DOWN:
                    direction.y = 1;
                    break;
                case COMMAND_LEFT:
                    direction.x = -1;
                    break;
                case COMMAND_RIGHT:
                    direction.x = 1;
                    break;
                case COMMAND_NEXT:
                    level++;
                    loadLevel();
                    break;
                case COMMAND_PREV:
                    level--;
                    loadLevel();
                    break;
                case COMMAND_RESET:
                    loadLevel();
                    break;
                case COMMAND_CONTINUE:
                    if (levelSolved) {
                        // level++;
                        // loadLevel();
                    }
                    break;
            }
            if ((direction.x != 0 || direction.y != 0) && !levelSolved) {
                var step = TABLE_WIDTH * (playerPos.y + direction.y) + playerPos.x + direction.x;
                var nextStep = TABLE_WIDTH * (playerPos.y + direction.y * 2) + playerPos.x + direction.x * 2;
                if (table[step] == FLOOR || table[step] == GOAL) {
                    playerPos.x += direction.x;
                    playerPos.y += direction.y;
                    moves++;
                } else if ((table[step] == BOX || table[step] == BOX_ON_GOAL) && (table[nextStep] == FLOOR || table[nextStep] == GOAL)) {
                    table[step] = table[step] == BOX ? FLOOR : GOAL;
                    table[nextStep] = table[nextStep] == FLOOR ? BOX : BOX_ON_GOAL;
                    playerPos.x += direction.x;
                    playerPos.y += direction.y;
                    moves++;
                    pushes++;
                }
                var boxesOnGoal = true;
                for (var i = 0; i < table.length; i++) {
                    if (table[i] == BOX) {
                        boxesOnGoal = false;
                    }
                }
                levelSolved = boxesOnGoal;
            }
        } else {
            gameStarted = true;
        }
        paint();
    }

    function addEventListeners() {
        window.addEventListener('keydown', handleKeyPressed, false);
        window.addEventListener('keyup', handleKeyReleased, false);
        var buttons = document.getElementsByTagName('button');
        for (var i = 0; i < buttons.length; i++) {
            if (!!buttons[i].id) {
                buttons[i].addEventListener('touchstart', handleButtonClick, false);
            }
        }
    }

    return {
        startGame: function() {
            var canvas = document.getElementById('boxbot4k');
            if (canvas != null && !!canvas.getContext) {
                context = canvas.getContext('2d');
                images = generateImages();
                table = new Array(TABLE_WIDTH * TABLE_HEIGHT);
                level = 0;
                playerPos = {
                    x: 0,
                    y: 0
                };
                gameStarted = false;
                keyPress = false;
                loadLevel();
                paint();
                addEventListeners();
                handleCommand("continue");
            } else {
                document.body.appendChild(document.createTextNode('Could not initialize game.'));
            }
        }
    }
})();