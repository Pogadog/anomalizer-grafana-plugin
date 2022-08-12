import MetricFigure from "types/MetricFigure";
const md5 = require('md5');


type MetricFigureLayout = MetricFigure["layout"];

export default class Reshade {

    cache: {
        [key: string]: string
    }

    constructor() {
        this.cache = {}
    }

    metricLayout = (layout: MetricFigureLayout): MetricFigureLayout => {

        layout.paper_bgcolor = "#222222"
        layout.plot_bgcolor = "#222222"
        if (!layout.font) layout.font = {}
        layout.font.color = "white"
        return layout;
    }

    metricImage = (img: string): string => {

        // take 512 char sample from img base64 starting at char 2048 and hash it

        let cacheKey = md5(img.slice(2048, 2560));

        let cache = this.cache[cacheKey]

        if (cache) {
            return cache
        }

        let p = new DOMParser();
        let x = p.parseFromString(decodeURIComponent(img.split(",", 2)[1]), "image/svg+xml");
    
        let background = "#222222";
    
        if (x.getElementsByTagName("rect")[0]) {
            // set background color of whole metric
            x.getElementsByTagName("rect")[0].style.fill = background;
        }
    
        if (x.getElementsByClassName("xzl zl crisp")[0]) {
            // set background color of x boundary line
            (x.getElementsByClassName("xzl zl crisp") as HTMLCollectionOf<HTMLElement>)[0].style.stroke = "white";
        }
    
        if (x.getElementsByClassName("yzl zl crisp")[0]) {
            // set background color of y boundary line
            (x.getElementsByClassName("yzl zl crisp") as HTMLCollectionOf<HTMLElement>)[0].style.stroke = "white";
        }
    
        for (let i=0; i<x.getElementsByClassName("xtick").length; i++) {
            // set color of x axis ticks
            if (x.getElementsByClassName("xtick")[i]) {
    
                x.getElementsByClassName("xtick")[i].getElementsByTagName("text")[0].style.fill = "white"

            }
        
        }
    
        for (let i=0; i<x.getElementsByClassName("ytick").length; i++) {
            // set color of y axis ticks
            if (x.getElementsByClassName("ytick")[i]) {
    
                x.getElementsByClassName("ytick")[i].getElementsByTagName("text")[0].style.fill = "white"
    
            }
        
        }
    
        if (x.getElementsByClassName("gtitle")[0]) {
            // set color of title text
            (x.getElementsByClassName("gtitle") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }
    
        if (x.getElementsByClassName("bg")[0]) {
            // set background color of legend
            (x.getElementsByClassName("bg") as HTMLCollectionOf<HTMLElement>)[0].style.fill = background;
        }
    
        for (let i=0; i<x.getElementsByClassName("legendtext").length; i++) {
            // set color of line legend text(s)
            if (x.getElementsByClassName("legendtext")[i]) {
    
                (x.getElementsByClassName("legendtext") as HTMLCollectionOf<HTMLElement>)[i].style.fill = "white"
            }
        }
    
        if (x.getElementsByClassName("legendtitletext")[0]) {
            // set color of legend title text
            (x.getElementsByClassName("legendtitletext") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }
    
    
        if (x.getElementsByClassName("xtitle")[0]) {
            // set color of x axis label
            (x.getElementsByClassName("xtitle") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }
    
        if (x.getElementsByClassName("ytitle")[0]) {
            // set color of y axis label
            (x.getElementsByClassName("ytitle") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }

        let result =  "data:image/svg+xml," + encodeURIComponent(new XMLSerializer().serializeToString(x))

        this.cache[cacheKey] = result
    
        return result;
    }
}
