// Adapted from https://github.com/monsterlessonsacademy/monsterlessonsacademy/blob/221-react-image-slider/src/ImageSlider.js

import { Button, Card, CardActions, CardContent, CardMedia} from "@mui/material";
import {ReactNode, useState} from "react";

export interface Slide {
    imageUrl?: string,
    child?: ReactNode,
    alt: string,
}

export interface SlidesProps {
    slides: Slide[],
}

export default function Slides(props: SlidesProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? props.slides.length - 1: currentIndex - 1;
        setCurrentIndex(newIndex);
    }

    const goToNext = () => {
        const isLastSlide = currentIndex === props.slides.length - 1;
        const newIndex = isLastSlide ? 0: currentIndex + 1;
        setCurrentIndex(newIndex);
    }

    const slide = props.slides[currentIndex];

    return (
        <Card sx={{width: "50%", height: "50%"}}>
            { slide.imageUrl && <CardMedia component="img" image={slide.imageUrl} alt={slide.alt} sx={{objectFit: "contain"}} /> }
            <CardContent>
                {slide.child ? slide.child : slide.alt }
            </CardContent>
            <CardActions style={{justifyContent: "center"}}>
                <Button size="small" onClick={goToPrevious}>Prev</Button>
                <Button size="small">{currentIndex + 1}/{props.slides.length}</Button>
                <Button size="small" onClick={goToNext}>Next</Button>          
            </CardActions>
        </Card>
    )
}