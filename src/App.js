import React, { Component } from 'react';
import './App.css';

class InteractiveView extends Component {
	static defaultProps = {
		bounds: {
			x: -Infinity,
			y: -Infinity,
			width: Infinity,
			height: Infinity
		},
		onTouch: v => {},
		onMove: (v, p) => {},
		onRelease: v => {}
	};

	set position(value) {
		if (!this.element) return;

		const pos = this.getBoundedPosition(value);
		this.element.style.left = `${pos.x}px`;
		this.element.style.top = `${pos.y}px`;
	}
	get position() {
		return this.element ? {
			x: this.element.offsetLeft,
			y: this.element.offsetTop
		} : null;
	}

	constructor() {
		super();

		this.touchHandler = this.touchHandler.bind(this);
		this.moveHandler = this.moveHandler.bind(this);
		this.releaseHandler = this.releaseHandler.bind(this);
		this.onRenderElement = this.onRenderElement.bind(this);
	}
	getBoundedPosition(pos) {
		const b = this.props.bounds;

		return {
			x: Math.min(Math.max(pos.x, b.x), b.width - this.width),
			y: Math.min(Math.max(pos.y, b.y), b.height - this.height)
		};
	}
	componentWillUnmount() {
		this.element.removeEventListener('mousedown', this.touchHandler);
		document.removeEventListener('mousemove', this.moveHandler);
		document.removeEventListener('mouseup', this.releaseHandler);
	}
	onRenderElement(element) {
		if (!element)
			return;

		this.element = element;
		element.addEventListener('mousedown', this.touchHandler);
	}
	touchHandler(e) {
		this.xi = e.clientX - this.element.offsetLeft;
		this.yi = e.clientY - this.element.offsetTop;
		this.element.style.zIndex = 1;

		this.props.onTouch(this);
		document.addEventListener('mousemove', this.moveHandler);
		document.addEventListener('mouseup', this.releaseHandler);
	}
	moveHandler(e) {
		const pos = this.getBoundedPosition({
			x: e.clientX - this.xi,
			y: e.clientY - this.yi
		});

		this.position = {
			...pos,
			...this.props.onMove(this, pos)
		};
	}
	releaseHandler(e) {
		document.removeEventListener('mousemove', this.moveHandler);
		document.removeEventListener('mouseup', this.releaseHandler);
		
		this.position = {
			...this.position,
			...this.props.onRelease(this, this.position)
		};

		this.element.style.zIndex = 0;
	}
}

class Piece extends InteractiveView {
	static SYMBOLS = ['\u2659', '\u2656', '\u2658', '\u2657', '\u2655', '\u2654',
		'\u265F', '\u265C', '\u265E', '\u265D', '\u265B', '\u265A'];

	constructor(props) {
		super(props);

		this.width = props.wCell - 8;
		this.height = props.hCell - 8;
	}
	render() {
		const pos = this.alignCenter(this.props.col, this.props.row);

		this.isWhite = this.props.type < 6;

		return <div ref={this.onRenderElement} className='interactive-view' style={{
			fontSize: `${this.width*.75}px`,
			textAlign: 'center',
			textShadow: '0 0 10px #FFFFFF',
			//backgroundColor: 'red',
			width: `${this.width}px`,
			height: `${this.height}px`,
			left: `${pos.x}px`,
			top: `${pos.y}px`
		}}>{Piece.SYMBOLS[this.props.type]}</div>
	}
	alignCenter(col, row) {
		if (col == null)
			col = this.props.col;

		if (row == null)
			row = this.props.row;

		return {
			x: this.props.wCell*col + (this.props.wCell - this.width)/2,
			y: this.props.hCell*row + (this.props.hCell - this.height)/2
		};
	}
	canMove(col, row, mapping) {
		const piece = mapping[`${row}:${col}`],
			dc = Math.abs(this.props.col - col),
			dr = Math.abs(this.props.row - row),
			type = this.props.type;
		
		// except for knight
		const noPiecesOnTheWay = () => {
			const colInc = dc === 0 ? 0 : this.props.col > col ? -1 : 1,
				rowInc = dr === 0 ? 0 : this.props.row > row ? -1 : 1,
				t = dc > 0 ? dc : dr;

			for (let i = 1, c = this.props.col + colInc, r = this.props.row + rowInc; i < t; ++i, c += colInc, r += rowInc)
				if (mapping[`${r}:${c}`])
					return false;

			return true;
		};

		// has not moved
		if ((dc === 0 && dr === 0) ||
			// piece in a non empty cell belongs to same team
			(piece != null && this.isWhite === piece.isWhite))
			// invalid move
			return false;

		const isEnemy = this.getIsEnemy(piece);
		let isValid = true;

		// validate move
		switch (type) {
			// bishop
			case 3:
			case 9:
				// diagonals
				isValid = dc === dr &&
					noPiecesOnTheWay();
				break;

			// rook
			case 1:
			case 7:
				// horiontals and verticals
				isValid = ((dc > 0 && dr === 0) ||
					(dc === 0 && dr > 0)) &&
					noPiecesOnTheWay();
				break;

			// queen
			case 4:
			case 10:
				// diagonals, horiontals and verticals
				isValid = (dc === dr ||
					(dc > 0 && dr === 0) ||
					(dc === 0 && dr > 0)) &&
					noPiecesOnTheWay();
				break;

			// king
			case 5:
			case 11:
				// one cell at a time
				isValid = dc <= 1 && dr <= 1 &&
					// diagonals, horiontals and verticals
					(dc === dr ||
					(dc > 0 && dr === 0) ||
					(dc === 0 && dr > 0)) &&
					noPiecesOnTheWay();
				break;

			// pawn
			case 0:
			case 6:
				// must be empty
				isValid = ((piece == null &&
					// verticals only
					dc === 0 &&
					// can move one cell or two if never moved
					(dr === 1 || (dr === 2 && this.props.row === (type === 0 ? 1 : 6))) &&
					noPiecesOnTheWay()) ||
					// or one step diagonal if enemy
					((dc === 1 && dr === 1) && isEnemy)) &&
					// always forward
					Boolean(type === 0 ^ this.props.row > row);
				break;

			// knight
			case 2:
			case 8:
				// back and forth only
				isValid = (dc === 1 && dr === 2) ||
					(dc === 2 && dr === 1);
				break;

			default: break;
		}

		return isValid;
	}
	getIsEnemy(piece) {
		return piece != null && this.isWhite !== piece.isWhite;
	}
}

export default class App extends Component {
	// MUST be an exponent of two
	static TILE_SIZE = 64;
	static TILE_SIZE_HALF = App.TILE_SIZE >> 1;
	static BITS_EXP = Math.log(App.TILE_SIZE)/Math.log(2);

	constructor() {
		super();

		this.state = {
			board: [
				[1,2,3,4,5,3,2,1],
				[0,0,0,0,0,0,0,0],
				[-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1],
				[6,6,6,6,6,6,6,6],
				[7,8,9,10,11,9,8,7]
			],
			highlight: null
		};

		this.wCell = App.TILE_SIZE;
		this.hCell = App.TILE_SIZE;
		this.width = this.wCell*this.state.board[0].length;
		this.height = this.hCell*this.state.board.length;

		this.onPieceMove = this.onPieceMove.bind(this);
		this.onPieceRelease = this.onPieceRelease.bind(this);
	}
	render() {
		this.currentMap = {};

		const pieces = this.state.board.map((v,row) =>
			v.map((v,col) =>
				v > -1 ? <Piece ref={v => { if (v) this.currentMap[`${v.props.row}:${v.props.col}`] = v }}
					type={v} col={col} row={row} wCell={this.wCell} hCell={this.hCell}
					bounds={{
						x: 0,
						y: 0,
						width: this.width,
						height: this.height
					}}
					onMove={this.onPieceMove}
					onRelease={this.onPieceRelease} /> : null));

		const highlight = this.state.highlight ? <div className='highlight'
			style={{
				width: this.wCell,
				height: this.hCell,
				left: this.state.highlight.col*this.wCell,
				top: this.state.highlight.row*this.hCell,
				backgroundColor: this.state.highlight.color
			}} /> : null

		return (
			<div className='wrapper' ref='container'>
				<canvas ref='bg' width={this.width} height={this.height} />
				{highlight}
				{pieces}
			</div>
		);
	}
	componentDidMount() {
		this.drawBackground();
	}
	drawBackground() {
		const bg = this.refs.bg,
			ctx = bg.getContext('2d'),
			cols = this.state.board[0].length,
			rows = this.state.board.length;
		
		ctx.clearRect(0, 0, bg.width, bg.height);

		for (let r = rows, c; r--;) {
			for (c = cols; c--;) {
				ctx.fillStyle = (r + c) & 1 ? 'green' : 'lightgreen';
				ctx.fillRect(c << App.BITS_EXP, r << App.BITS_EXP, this.wCell, this.hCell);
			}
		}

		ctx.strokeRect(0, 0, this.width, this.height);
	}
	onPieceMove(piece, pos) {
		const row = Math.round(pos.y/this.hCell),
			col = Math.round(pos.x/this.wCell);

		if (row === this.lastMovedRow && col === this.lastMovedCol)
			return;

		this.lastMovedCol = col;
		this.lastMovedRow = row;

		this.setState({
			...this.state,
			highlight: row !== piece.props.row || col !== piece.props.col ? {
				col: col,
				row: row,
				color: this.canMove(col, row, piece) ? '#09c' : '#c60'
			} : null
		});
	}
	onPieceRelease(piece, pos) {
		//const col = Math.round(pos.x/this.wCell),
			//row = Math.round(pos.y/this.hCell),
		const col = (pos.x + App.TILE_SIZE_HALF) >> App.BITS_EXP,
			row = (pos.y + App.TILE_SIZE_HALF) >> App.BITS_EXP;
		
		let state = {
			highlight: null
		}, initCoords = null;

		if (this.canMove(col, row, piece)) {
			if (piece.getIsEnemy(this.currentMap[`${row}:${col}`]))
				console.info('score:', piece.isWhite ? 'white' : 'black');

			state.board = this.state.board.map(v => v.slice());
			state.board[piece.props.row][piece.props.col] = -1;
			state.board[row][col] = piece.props.type;
		}
		// reset
		else initCoords = piece.alignCenter();
		
		this.setState(state);

		return initCoords;
	}
	canMove(col, row, piece) {
		return piece.canMove(col, row, this.currentMap);
	}
}
