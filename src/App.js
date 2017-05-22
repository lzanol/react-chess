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

		const b = this.props.bounds;
		this.element.style.left = `${Math.min(Math.max(value.x, b.x), b.width - this.width)}px`;
		this.element.style.top = `${Math.min(Math.max(value.y, b.y), b.height - this.height)}px`;
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
	onRenderElement(element) {
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
		const x = e.clientX - this.xi,
			y = e.clientY - this.yi;

		this.position = {
			x: x,
			y: y,
			...this.props.onMove(this, {x, y})
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
		return {
			x: this.props.wCell*col + (this.props.wCell - this.width)/2,
			y: this.props.hCell*row + (this.props.hCell - this.height)/2
		};
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
			]
		};
		
		this.width = 380;
		this.height = 380;
		this.wCell = this.width/this.state.board[0].length;
		this.hCell = this.height/this.state.board.length;

		this.onRenderCanvas = this.onRenderCanvas.bind(this);
		this.onPieceMove = this.onPieceMove.bind(this);
	}
	render() {
		const pieces = this.state.board.map((v,row) =>
			v.map((v,col) =>
				v >= 0 ? <Piece type={v} col={col} row={row} wCell={this.wCell} hCell={this.hCell}
					bounds={{x: 0, y: 0, width: this.width, height: this.height}}
					onMove={this.onPieceMove}
					onRelease={this.onPieceRelease} /> : null));

		return (
			<div className='wrapper'>
				<canvas ref={this.onRenderCanvas} width={this.width} height={this.height} />
				{pieces}
			</div>
		);
	}
	onRenderCanvas(elm) {
		const ctx = elm.getContext('2d'),
			cols = this.state.board[0].length,
			rows = this.state.board.length;
		
		for (let i = cols, j; i--;) {
			for (j = rows; j--;) {
				ctx.fillStyle = (j + i) & 1 ? 'green' : 'lightgreen';
				ctx.fillRect(i*this.wCell, j*this.hCell, this.wCell, this.hCell);
			}
		}

		ctx.strokeRect(0, 0, this.width, this.height);
	}
	onPieceMove(piece, pos) {
		//return piece.alignCenter(Math.round(pos.x/this.wCell), Math.round(pos.y/this.hCell));
	}
	onPieceRelease(piece, pos) {
		return piece.alignCenter(Math.round(pos.x/this.wCell), Math.round(pos.y/this.hCell));
	}
}
