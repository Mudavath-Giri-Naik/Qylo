"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { galleryIndex, galleryOffset } from "@/lib/cojeev/reference-gallery-geometry";
import { useMotionVisibility } from "@/lib/cojeev-motion/use-motion-visibility";
import { useGalleryRef, useGallerySelection } from "@/lib/cojeev/reference-gallery-motion";
export type OptionWheelItem={id:string;label:string;description?:string};
export type OptionWheelProps=Omit<React.ComponentProps<"div">,"onChange"> & {items:readonly OptionWheelItem[];defaultIndex?:number;selectedIndex?:number;onSelectionChange?:(index:number)=>void;side?:"left"|"right"};

/** Angle between neighbouring spokes of the wheel, in degrees. */
const STEP=30;
/** Spokes rendered around the selection: ±1 visible, ±2 fully faded so items
    enter and leave along the arc instead of popping in. */
const SLOTS=[-2,-1,0,1,2];
const slotOpacity=(d:number)=>d===0?1:Math.abs(d)===1?.5:0;

export function OptionWheel({items,defaultIndex=0,selectedIndex,onSelectionChange,side="left",className,ref,...props}:OptionWheelProps){
 const host=React.useRef<HTMLDivElement>(null),id=React.useId();const {enabled,inView}=useMotionVisibility(host);
 const {selected,select}=useGallerySelection(items.length,defaultIndex,selectedIndex,onSelectionChange);
 // `turn` counts rotation steps without wrapping, and spokes are keyed by it,
 // so the wheel always turns the short way and the item that wraps from one
 // end to the other does so while invisible instead of sweeping across.
 const [turn,setTurn]=React.useState(Math.max(selected,0));
 const [prev,setPrev]=React.useState(selected);
 if(prev!==selected){setPrev(selected);if(selected>=0&&prev>=0)setTurn(turn+galleryOffset(selected,prev,items.length));}
 const key=(event:React.KeyboardEvent<HTMLDivElement>)=>{let next=selected;if(event.key==="ArrowDown"||event.key==="ArrowRight")next++;else if(event.key==="ArrowUp"||event.key==="ArrowLeft")next--;else if(event.key==="Home")next=0;else if(event.key==="End")next=items.length-1;else return;event.preventDefault();select(next);};
 const dir=side==="left"?1:-1;
 return <div {...props} ref={useGalleryRef(host,ref)} data-slot="option-wheel" data-motion={enabled&&inView ? "on":"off"} data-side={side} className={cn("v-option-wheel",className)}>
 <div role="listbox" aria-label={props["aria-label"]??"Choose an option"} aria-activedescendant={selected>=0 ? `${id}-${turn}`:undefined} tabIndex={items.length?0:-1} onKeyDown={key} className="v-option-wheel__stage">
 <span aria-hidden="true" className="v-option-wheel__ring" style={{transform:`translate(-50%,-50%) rotate(${-turn*STEP*dir}deg)`}}/>
 <span aria-hidden="true" className="v-option-wheel__hub"/>
 {items.length>0&&SLOTS.map(d=>{const pos=turn+d,index=galleryIndex(pos,items.length),item=items[index],live=Math.abs(d)<=1&&(d===0||items.length>=3);return <div key={pos} aria-hidden={!live||undefined} className="v-option-wheel__arm" style={{transform:`rotate(${d*STEP*dir}deg)`,opacity:slotOpacity(d),pointerEvents:live?"auto":"none"}}>
  <div id={live?`${id}-${pos}`:undefined} role={live?"option":undefined} aria-selected={live?d===0:undefined} onClick={event=>{select(index);(event.currentTarget.closest("[role=listbox]") as HTMLElement|null)?.focus();}} className="v-option-wheel__option">{item.label}</div>
 </div>;})}
 {!items.length&&<p>No options available.</p>}
 </div>
 <div className="v-option-wheel__footer"><button type="button" aria-label="Previous option" disabled={items.length<2} onClick={()=>select(selected-1)}>↑</button>
 {/* Every description shares one grid cell, so the footer is always as tall as
     the longest one and the card never resizes as the wheel turns. */}
 <div role="status" className="v-option-wheel__desc">{items.length?items.map((item,index)=><p key={item.id} data-active={index===selected} aria-hidden={index!==selected||undefined}>{item.description??item.label}</p>):<p data-active="true">No selection</p>}</div>
 <button type="button" aria-label="Next option" disabled={items.length<2} onClick={()=>select(selected+1)}>↓</button></div>
 </div>;
}
