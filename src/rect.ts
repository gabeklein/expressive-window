type RectProps = {
	rect: DOMRect;
	callbacks: Set<Function>;
};

let COMPARE_KEYS = [
	"bottom", "height", "left", "right", "top", "width",
] as const;

const observedNodes = new Map<Element, RectProps>();
let ready: boolean;

function observeForChanges(){
	if(ready){
		observedNodes.forEach(propogateChanges);
		window.requestAnimationFrame(observeForChanges);
	}
};

function propogateChanges(
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

export function observeRect(
	node: Element, 
	callback: (rect: DOMRect) => void){

	let state = observedNodes.get(node)!;

	if(state)
		state.callbacks.add(callback);
	else {
		state = {
			rect: {} as any,
			callbacks: new Set([callback])
		}

		observedNodes.set(node, state);

		if(!ready){
			ready = true;
			observeForChanges();
		}
	}

	return function release(){
		state.callbacks.delete(callback);

		if(!state.callbacks.size)
			observedNodes.delete(node);

		if(!observedNodes.size)
			ready = false;
	}
}