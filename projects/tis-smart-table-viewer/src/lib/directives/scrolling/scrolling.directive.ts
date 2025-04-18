import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appScrolling]',
    standalone: false
})
export class ScrollingDirective {
  constructor(private el: ElementRef) { }
  
  @Input() appScrolling: boolean = false;

  // @HostListener('mouseenter') onMouseEnter() {}

  @HostListener('mouseleave') onMouseLeave() {
    // console.log("==== appScrolling mouseleave ===", this.el.nativeElement, this.appScrolling);
    this.el.nativeElement.classList.remove('more-scrollbar-width', 'more-scrollbar-height')
  }

  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) {
    // console.log("==== appScrolling mousemove clientX-clientY ===", event.clientX, event.clientY);
    // console.log("==== appScrolling mousemove clientWidth-clientHeight ===", this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
    // console.log("==== appScrolling mousemove offsetX-offsetY ===", this.el.nativeElement.offsetX, this.el.nativeElement.offsetY);
    // console.log("==== appScrolling mousemove offsetWidth-offsetLeft ===", this.el.nativeElement.offsetWidth, this.el.nativeElement.offsetLeft);
    // console.log("==== appScrolling mousemove json ===", {
    //   clientX: event.clientX,
    //   clientY: event.clientY,
    //   clientWidth: this.el.nativeElement.clientWidth,
    //   clientHeight: this.el.nativeElement.clientHeight,
    //   offsetX: this.el.nativeElement.offsetX,
    //   offsetY: this.el.nativeElement.offsetY,
    //   offsetWidth: this.el.nativeElement.offsetWidth,
    //   offsetLeft: this.el.nativeElement.offsetLeft,
    //   rect: this.el.nativeElement.getBoundingClientRect()
    // });

    const rect = this.el.nativeElement.getBoundingClientRect()

    let xDistance = rect.left + this.el.nativeElement.clientWidth + 10 - event.clientX;
    // console.log("=== appScrolling mousemove xDistance ===", xDistance);
    xDistance < 15 && xDistance > -15 ? this.el.nativeElement.classList.add('more-scrollbar-width'): this.el.nativeElement.classList.remove('more-scrollbar-width');

    let yDistance = rect.top + this.el.nativeElement.clientHeight + 15 - event.clientY;
    // console.log("=== appScrolling mousemove yDistance ===", yDistance);
    yDistance < 20 && yDistance > -20 ? this.el.nativeElement.classList.add('more-scrollbar-height'): this.el.nativeElement.classList.remove('more-scrollbar-height');
    // this.el.nativeElement.classList.remove('more-scrollbar-width', 'more-scrollbar-height')
  }

}
