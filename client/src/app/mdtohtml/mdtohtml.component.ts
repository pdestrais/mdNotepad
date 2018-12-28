import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as marked from 'marked';

@Component({
  selector: 'app-mdtohtml',
  templateUrl: './mdtohtml.component.html',
  styleUrls: ['./mdtohtml.component.scss']
})
export class MdtohtmlComponent implements OnInit {

  @Input()
  public content: string = '';

  @ViewChild('mdRender')
  public mdRenderer: ElementRef;

  constructor() {
   }

  ngOnInit() {
    console.log("[MdtohtmlComponent - ngOnInit]");
    if (this.content && this.content.length > 0) {
        const markdownHtml = marked(this.content);
        this.mdRenderer.nativeElement.innerHTML = markdownHtml;
    }
  }

}
