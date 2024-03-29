/* sprites  */
let char = [
	'            ^__^',
	'    _______/(oo)',
	'/\\/(       /(__)',
	'   | w----||    ',
	'   ||     ||    '
];

let obstacle = [
	'  |  ',
	'(_|_)',
	'  |  '
];

let stones = ['=', '-'];
let ground = '';

/* global variables */
let len = 60;        /* length of road */
let dist = 100;      /* distance from obstacle */
let airtime = 0;     /* time player has left airborne */
let dead = false;    /* is the player dead? */
let score = 0;       /* total points earned by player */
let high;            /* players high score */
let speed = 1;       /* speed of gameplay */
let tic = 0;         /* tic counter used for leg animation */
let fps = 30;        /* how many frames to render a second */
let frame = 0;       /* frame of leg animation */
let awoke = false;   /* has the game been started? */
let element;         /* game canvas */
let container;       /* div containing game canvas */
let interval;        /* stores the game update interval */
let bbtext = '';     /* text in the bottom middle of screen */
let bbflash = false; /* is the billboard flashing? */
let bbtime = 0;      /* time to display billboard for */

function draw()
{
	/* string to store current frame */
	let out = '';

	/* frame for leg animation */
	let legs = '||     ||';

	/* if player isn't jumping */
	if (airtime <= 0)
	{
		/* die on collision */
		if (dist < char[0].length)
		{
			/* death sprite */
			char[1] = char[1].substring(0, 13) + 'xx' + char[1].substring(13 + 2);
			char[3] = char[3].substring(0, 14) + 'U' + char[3].substring(14 + 1);

			/* keep player airborne if died above obstacle */
			if (dist < char[0].length - speed)
			{
				airtime = 1;
			}

			/* update high score */
			if (score > high)
			{
				high = score;
				localStorage.setItem('high', score);
			}

			/* list of all game over messages */
			const gameovermsg = [
				'try again :(',
				'rest in peace',
				'see you space cow'
			];

			/* update billboard */
			bbtext = gameovermsg[Math.floor(Math.random() * gameovermsg.length)];
			bbtime = 1;
			bbflash = false;

			dead = true;
			clearInterval(interval);
		}

		/* don't do these things if dead and airborne */
		if (!(dead && airtime))
		{
			/* animate legs on ground */
			if (!frame)
			{
				legs = '|╵     |╵';
			}

			else
			{
				legs = '╵|     ╵|';
			}

			/* add whitespace to account for jump height */
			out += '<br>'.repeat(obstacle.length);
		}
	}

	/* apply leg animation */
	char[4] = char[4].substring(0, 3) + legs + char[4].substring(3 + 9);

	/* is obstacle out of bounds? */
	let oob = dist > len;

	/* allow to seamlessly roll on canvas */
	let range = obstacle[0].length;
	let right = Math.abs(dist - len);
	if (right < obstacle.length)
	{
		range = right;
	}

	/* iterate through character sprite line by line */
	for (let i = 0; i < char.length; i++)
	{
		/* add current line of character to output */
		out += char[i];

		/* add obstacle on same line if player isn't jumping */
		if (i >= char.length - obstacle.length && airtime <= 0)
		{
			/* lock obstacle into player to avoid clipping */
			let space = dist - char[i].length;
			if (space <= 0)
			{
				space = 0;
			}

			/* draw obstacle if obstacle is in bounds */
			if (!oob)
			{
				out += ' '.repeat(space) + obstacle[i - char.length + obstacle.length].substr(0, right);
			}
		}

		out += '<br>';
	}

	/* draw obstacle below player if jumping */
	if (airtime > 0)
	{
		for (let i = 0; i < obstacle.length; i++)
		{
			/* allow to seamlessly roll off canvas */
			let space = dist;
			let left = 0;
			if (dist <= 0)
			{
				space = 0;
				left = Math.abs(dist);
			}

			/* draw obstacle if obstacle is in bounds */
			if (!oob)
			{
				out += ' '.repeat(space) + obstacle[i].substr(left, right);
			}

			out += '<br>';
		}
	}


	/* draw ground */
	out += ground + '<br>'; 

	/* draw scoreboard */
	let scoretxt = 'score: ' + score;
	let hightxt = 'high score: ' + high;
	let billboard = '';

	if (Math.floor(bbtime / 10) % 2 == 0 && bbtime > 0 & bbflash)
	{
		billboard = bbtext;
	}

	if (!bbflash && bbtime > 0)
	{
		billboard = bbtext;
	}

	let leftgap = len/2 - scoretxt.length - (Math.floor(billboard.length/2)) - 1;
	let rightgap = len/2 - hightxt.length - (Math.ceil(billboard.length/2)) -1;

	let bottom  = ' '.repeat(leftgap) + billboard + ' '.repeat(rightgap);

    out += ' ' + scoretxt + bottom + hightxt;

	return out;
}


function update()
{
	if (!dead)
	{
		/* update frame counter */
		tic++;

		/* scroll the obstacle towards the player */
		dist -= speed;

		/* increase score for every frame alive */
		score++;

		if (bbtime > 0)
		{
			bbtime--;
		}

		if (bbtime == 0)
		{
			billboard = '';
		}

		/* update and draw the ground */
		ground = ground.substring(speed);
		for (let i = 0; i < speed; i++)
		{
			ground += stones[Math.floor(Math.random() * stones.length)];
		}

		/* decrease players airtime if jumping */
		if (airtime > 0)
		{
			airtime--;
		}

		/* reset distance when obstacle goes off screen */
		if (dist <= -obstacle[0].length)
		{
			let levelmult = 1;

			/* speed up game every 1000 points */
			if (speed <= 3 && speed != Math.ceil(score / 1000))
			{
				/* speed up! */
				speed++;

				/* double gap on speed increase */
				levelmult = 2;

				/* update billboard */
				bbtext = 'level++';
				bbtime = 90;
				bbflash = true;
			}

			/* increase gap based on speed */
			let speedmult = 1 + ((speed - 1) * 0.5);

			/* reset obstacle distance */
			dist = (len * 1.75 + Math.floor(Math.random() * 30)) * speedmult * levelmult;
		}

		/* update frame */
		if (tic > Math.ceil(fps / (speed + 1)))
		{
			tic = 0;
			frame = 1 - frame;
		}
	}

	/* update the game canvas */
	element.innerHTML = draw().replace(/ /g, '&nbsp;');
}

function awake()
{
	/* can't wake the game up twice */
	if (awoke)
	{
		return;
	}

	awoke = true;

	/* set high score */
	high = localStorage.getItem('high') || 0;

	/* get game canvas */
	element = document.getElementById('game');

	/* generate ground texture */
	worldgen();

	/* begin the update loop */
	interval = setInterval(update, 1000/fps);
}

function worldgen()
{
	/* clear existing ground */
	ground = ''

	/* generate the initial ground texture */
	for (let i = 0; i < len; i++)
	{
		ground += stones[Math.floor(Math.random() * stones.length)];
	}
}

function reset()
{
	/* regenerate ground texture */
	worldgen();

	/* reset game variables */
	speed = 1;
	score = 0;
	dist = 100;
	airtime = 0;
	dead = false;
	bbtext = '';
	bbtime = 0;
	bbflash = false;

	/* reset sprite */	
	char[1] = char[1].substring(0, 13) + 'oo' + char[1].substring(13 + 2);
	char[3] = char[3].substring(0, 14) + ' ' + char[3].substring(14 + 1);

	/* reset the update loop */
	interval = setInterval(update, 1000/fps);
}

function input()
{
	/* wake game */
	if (!awoke)
	{
		awake();
		return;
	}

	/* jump if not dead */
	if (!dead)
	{
		if (airtime <= 0)
		{
			airtime = 30;
		}
	}

	/* reset game if dead */
	else
	{
		reset();
	}
}

onkeyup = function(e)
{
	if (e.code == "Space")
	{
		input();
	}
}

ontouchstart = function(e)
{
	if (awoke)
	{
		input();
	}
}
