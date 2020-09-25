type RectProps = {
	rect: DOMRect;
	callbacks: Set<Function>;
};

let COMPARE_KEYS = [
	"bottom", "height", "left", "right", "top", "width",
] as const;

const observedNodes = new Map<Element, RectProps>();
let active: boolean;

export function observeRect(
	node: Element, 
	callback: (rect: DOMRect) => void){

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

	const current = node.getBoundingClientRect();

	for(const key of COMPARE_KEYS)
		if(current[key] !== state.rect[key]){
			state.rect = current;
			for(const updated of state.callbacks)
				updated(current);
			break;
		}
}