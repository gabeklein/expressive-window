export type ClientRect = {
	width: number,
	height: number
}

type RectProps = {
	callbacks: Set<Function>;
	rect: ClientRect;
};

let COMPARE_KEYS = [
	"height",
	"width",
] as const;

const observedNodes = new Map<Element, RectProps>();
let active: boolean;

export function getRect(node: Element){
	return {
		width: node.clientWidth,
		height: node.clientHeight
	}
}

export function observeRect(
	node: Element, 
	callback: (rect: ClientRect) => void){

	let state = observedNodes.get(node)!;

	if(state)
		state.callbacks.add(callback);
	else {
		observedNodes.set(node, state = {
			rect: {} as any,
			callbacks: new Set([callback])
		});

		if(!active){
			active = true;
			checkForUpdates();
		}
	}

	return function release(){
		state.callbacks.delete(callback);

		if(!state.callbacks.size)
			observedNodes.delete(node);

		if(!observedNodes.size)
			active = false;
	}
}

function checkForUpdates(){
	if(active){
		observedNodes.forEach(assertDidUpdate);
		window.requestAnimationFrame(checkForUpdates);
	}
};

function assertDidUpdate(
	state: RectProps, node: Element){

	const current = getRect(node);

	for(const key of COMPARE_KEYS)
		if(current[key] !== state.rect[key]){
			state.rect = current;
			for(const updated of state.callbacks)
				updated(current);
			break;
		}
}