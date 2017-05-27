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
		this.position = {...this.position, ...this.props.onRelease(this, this.position)};
	}
}

class Piece extends InteractiveView {
	static SYMBOLS = ['\u2659', '\u2656', '\u2658', '\u2657', '\u2655', '\u2654',
		'\u265F', '\u265C', '\u265E', '\u265D', '\u265B', '\u265A'];

	constructor() {
		super();

		this.width = 40;
		this.height = 40;
	}
	componentWillMount() {
		this.isWhite = this.props.type < 6;
	}
	render() {
		const pos = this.alignCenter(this.props.col, this.props.row);

		return <div ref={this.onRenderElement} className='interactive-view' style={{
			fontSize: '32px',
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
	canMove(piece) {
		// different place
		return (this.props.row !== piece.props.row || this.props.col !== piece.props.col)
			// different team
			&& this.isWhite !== piece.isWhite;
	}
}

export default class App extends Component {
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
			highlights: false
		};
		
		this.width = 380;
		this.height = 380;
		this.wCell = this.width/this.state.board[0].length;
		this.hCell = this.height/this.state.board.length;

		this.onPieceMove = this.onPieceMove.bind(this);
		this.onPieceRelease = this.onPieceRelease.bind(this);
	}
	render() {
		this.currentMap = {};

		const pieces = this.state.board.map((v,row) =>
			v.map((v,col) =>
				v > -1 ? <Piece ref={v => { if (v) this.currentMap[`${v.props.row}:${v.props.col}`] = v }}
					type={v} col={col} row={row} wCell={this.wCell} hCell={this.hCell}
					bounds={{x: 0, y: 0, width: this.width, height: this.height}}
					onMove={this.onPieceMove}
					onRelease={this.onPieceRelease} /> : null));

		return (
			<div className='wrapper'>
				<canvas ref="bg" width={this.width} height={this.height} />
				{pieces}
			</div>
		);
	}
	componentDidMount() {
		this.updateBackground();
	}
	componentDidUpdate() {
		this.updateBackground();
	}
	updateBackground() {
		const bg = this.refs.bg,
			ctx = bg.getContext('2d'),
			cols = this.state.board[0].length,
			rows = this.state.board.length;
		
		ctx.clearRect(0, 0, bg.width, bg.height);

		for (let r = rows, c; r--;) {
			for (c = cols; c--;) {
				ctx.fillStyle = this.state.highlights[`${r}:${c}`] ? 'blue' :
					(r + c) & 1 ? 'green' : 'lightgreen';
				ctx.fillRect(c*this.wCell, r*this.hCell, this.wCell, this.hCell);
			}
		}

		ctx.strokeRect(0, 0, this.width, this.height);
	}
	onPieceMove(piece, pos) {
		const row = Math.round(pos.y/this.hCell),
			col = Math.round(pos.x/this.wCell);

		if ((row === piece.props.row && col === piece.props.col) ||
			(row === this.rowLastMoved && col === this.colLastMoved))
			return;

		this.rowLastMoved = row;
		this.colLastMoved = col;

		this.setState({
			...this.state,
			highlights: { [`${row}:${col}`]: true }
		});
	}
	onPieceRelease(piece, pos) {
		const col = Math.round(pos.x/this.wCell),
			row = Math.round(pos.y/this.hCell),
			pTarget = this.currentMap[`${row}:${col}`];
		let newBoard = {},
			asdf = {};

		// empty spot or able to move
		if (pTarget == null || pTarget.canMove(piece)) {
			newBoard = this.state.board.map(v => v.slice());
			newBoard[piece.props.row][piece.props.col] = -1;
			newBoard[row][col] = piece.props.type;
		}
		// reset
		else asdf = piece.alignCenter();

		this.setState({
			...newBoard,
			highlights: {}
		});

		return asdf;
	}
}
