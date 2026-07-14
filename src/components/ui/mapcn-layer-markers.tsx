"use client";

import MapLibreGL, { type PopupOptions, type MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type * as GeoJSON from 'geojson';
import "./mapcn-layer-markers.css";
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useId,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Maximize, Loader2 } from "lucide-react";

function cn(...inputs: Array<string | false | null | undefined>) {
    return inputs.filter(Boolean).join(" ");
}

const tiendaDeTelas = "#00c3ff";
const tiendaDeRopa = "#0017e5";
const mayoristaTextil="#4affc6";
const mercadoMayoristaDeRopa="#3e3e3e";
const fbrica="#ff0000";
const tiendaDeDeportes ="#000000";
const modista ="#FFFF";
const almacn ="#ff0000";
const centroDeReciclaje ="#09ff00";
const centroComunitario ="#ff00f7";
const tejedura ="#FFFF";
const centroComercial = "#ffff";
const comercio = "#ffff";
const tiendaDeCortinas = "#ffff";
const cooperativaLaVictoria = "#370065";



const defaultStyles = {
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type Theme = "light" | "dark";

function getDocumentTheme(): Theme | null {
    if (typeof document === "undefined") return null;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return null;
}

function getSystemTheme(): Theme {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
    const [detectedTheme, setDetectedTheme] = useState<Theme>(
        () => getDocumentTheme() ?? getSystemTheme(),
    );

    useEffect(() => {
        if (themeProp) return;

        const observer = new MutationObserver(() => {
            const docTheme = getDocumentTheme();
            if (docTheme) {
                setDetectedTheme(docTheme);
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = (e: MediaQueryListEvent) => {
            if (!getDocumentTheme()) {
                setDetectedTheme(e.matches ? "dark" : "light");
            }
        };
        mediaQuery.addEventListener("change", handleSystemChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener("change", handleSystemChange);
        };
    }, [themeProp]);

    return themeProp ?? detectedTheme;
}

type MapContextValue = {
    map: MapLibreGL.Map | null;
    isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a Map component");
    }
    return context;
}

type MapViewport = {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;

type MapRef = MapLibreGL.Map;

type MapProps = {
    children?: ReactNode;
    className?: string;
    theme?: Theme;
    styles?: {
        light?: MapStyleOption;
        dark?: MapStyleOption;
    };
    projection?: MapLibreGL.ProjectionSpecification;
    viewport?: Partial<MapViewport>;
    onViewportChange?: (viewport: MapViewport) => void;
    loading?: boolean;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

function DefaultLoader() {
    return (
        <div className="map-default-loader">
            <div className="map-loader-dots">
                <span className="map-loader-dot" />
                <span className="map-loader-dot" />
                <span className="map-loader-dot" />
            </div>
        </div>
    );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
    const center = map.getCenter();
    return {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
    };
}

const Map = forwardRef<MapRef, MapProps>(function Map(
    {
        children,
        className,
        theme: themeProp,
        styles,
        projection,
        viewport,
        onViewportChange,
        loading = false,
        ...props
    },
    ref,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStyleLoaded, setIsStyleLoaded] = useState(false);
    const currentStyleRef = useRef<MapStyleOption | null>(null);
    const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const internalUpdateRef = useRef(false);
    const resolvedTheme = useResolvedTheme(themeProp);

    const isControlled = viewport !== undefined && onViewportChange !== undefined;

    const onViewportChangeRef = useRef(onViewportChange);
    onViewportChangeRef.current = onViewportChange;

    const mapStyles = useMemo(
        () => ({
            dark: styles?.dark ?? defaultStyles.dark,
            light: styles?.light ?? defaultStyles.light,
        }),
        [styles],
    );

    useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

    const clearStyleTimeout = useCallback(() => {
        if (styleTimeoutRef.current) {
            clearTimeout(styleTimeoutRef.current);
            styleTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const initialStyle =
            resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
        currentStyleRef.current = initialStyle;

        const map = new MapLibreGL.Map({
            container: containerRef.current,
            style: initialStyle,
            renderWorldCopies: false,
            attributionControl: {
                compact: true,
            },
            ...props,
            ...viewport,
        });

        const styleDataHandler = () => {
            clearStyleTimeout();
            styleTimeoutRef.current = setTimeout(() => {
                setIsStyleLoaded(true);
                if (projection) {
                    (map as unknown as { setProjection?: (projection: MapLibreGL.ProjectionSpecification) => void })
                        .setProjection?.(projection);
                }
            }, 100);
        };
        const loadHandler = () => setIsLoaded(true);

        const handleMove = () => {
            if (internalUpdateRef.current) return;
            onViewportChangeRef.current?.(getViewport(map));
        };

        map.on("load", loadHandler);
        map.on("styledata", styleDataHandler);
        map.on("move", handleMove);
        setMapInstance(map);

        return () => {
            clearStyleTimeout();
            map.off("load", loadHandler);
            map.off("styledata", styleDataHandler);
            map.off("move", handleMove);
            map.remove();
            setIsLoaded(false);
            setIsStyleLoaded(false);
            setMapInstance(null);
        };
    }, []);

    useEffect(() => {
        if (!mapInstance || !isControlled || !viewport) return;
        if (mapInstance.isMoving()) return;

        const current = getViewport(mapInstance);
        const next = {
            center: viewport.center ?? current.center,
            zoom: viewport.zoom ?? current.zoom,
            bearing: viewport.bearing ?? current.bearing,
            pitch: viewport.pitch ?? current.pitch,
        };

        if (
            next.center[0] === current.center[0] &&
            next.center[1] === current.center[1] &&
            next.zoom === current.zoom &&
            next.bearing === current.bearing &&
            next.pitch === current.pitch
        ) {
            return;
        }

        internalUpdateRef.current = true;
        mapInstance.jumpTo(next);
        internalUpdateRef.current = false;
    }, [mapInstance, isControlled, viewport]);

    useEffect(() => {
        if (!mapInstance || !resolvedTheme) return;

        const newStyle =
            resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

        if (currentStyleRef.current === newStyle) return;

        clearStyleTimeout();
        currentStyleRef.current = newStyle;
        setIsStyleLoaded(false);

        mapInstance.setStyle(newStyle, { diff: true });
    }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

    const contextValue = useMemo(
        () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
        [mapInstance, isLoaded, isStyleLoaded],
    );

    return (
        <MapContext.Provider value={contextValue}>
            <div
                ref={containerRef}
                className={cn("map-root", className)}
            >
                {(!isLoaded || loading) && <DefaultLoader />}
                {mapInstance && children}
            </div>
        </MapContext.Provider>
    );
});

type MarkerContextValue = {
    marker: MapLibreGL.Marker;
    map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
    const context = useContext(MarkerContext);
    if (!context) {
        throw new Error("Marker components must be used within MapMarker");
    }
    return context;
}

type MapMarkerProps = {
    longitude: number;
    latitude: number;
    children: ReactNode;
    onClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onDragStart?: (lngLat: { lng: number; lat: number }) => void;
    onDrag?: (lngLat: { lng: number; lat: number }) => void;
    onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
    longitude,
    latitude,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    draggable = false,
    ...markerOptions
}: MapMarkerProps) {
    const { map } = useMap();

    const callbacksRef = useRef({
        onClick,
        onMouseEnter,
        onMouseLeave,
        onDragStart,
        onDrag,
        onDragEnd,
    });
    callbacksRef.current = {
        onClick,
        onMouseEnter,
        onMouseLeave,
        onDragStart,
        onDrag,
        onDragEnd,
    };

    const marker = useMemo(() => {
        const markerInstance = new MapLibreGL.Marker({
            ...markerOptions,
            element: document.createElement("div"),
            draggable,
        }).setLngLat([longitude, latitude]);

        const handleClick = (e: MouseEvent) => callbacksRef.current.onClick?.(e);
        const handleMouseEnter = (e: MouseEvent) =>
            callbacksRef.current.onMouseEnter?.(e);
        const handleMouseLeave = (e: MouseEvent) =>
            callbacksRef.current.onMouseLeave?.(e);

        markerInstance.getElement()?.addEventListener("click", handleClick);
        markerInstance
            .getElement()
            ?.addEventListener("mouseenter", handleMouseEnter);
        markerInstance
            .getElement()
            ?.addEventListener("mouseleave", handleMouseLeave);

        const handleDragStart = () => {
            const lngLat = markerInstance.getLngLat();
            callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
        };
        const handleDrag = () => {
            const lngLat = markerInstance.getLngLat();
            callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
        };
        const handleDragEnd = () => {
            const lngLat = markerInstance.getLngLat();
            callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
        };

        markerInstance.on("dragstart", handleDragStart);
        markerInstance.on("drag", handleDrag);
        markerInstance.on("dragend", handleDragEnd);

        return markerInstance;
    }, []);

    useEffect(() => {
        if (!map) return;

        marker.addTo(map);

        return () => {
            marker.remove();
        };
    }, [map]);

    if (
        marker.getLngLat().lng !== longitude ||
        marker.getLngLat().lat !== latitude
    ) {
        marker.setLngLat([longitude, latitude]);
    }
    if (marker.isDraggable() !== draggable) {
        marker.setDraggable(draggable);
    }

    const currentOffset = marker.getOffset();
    const newOffset = markerOptions.offset ?? [0, 0];
    const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
        ? newOffset
        : [newOffset.x, newOffset.y];
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
        marker.setOffset(newOffset);
    }

    if (marker.getRotation() !== markerOptions.rotation) {
        marker.setRotation(markerOptions.rotation ?? 0);
    }
    if (marker.getRotationAlignment() !== markerOptions.rotationAlignment) {
        marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
    }
    if (marker.getPitchAlignment() !== markerOptions.pitchAlignment) {
        marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
    }

    return (
        <MarkerContext.Provider value={{ marker, map }}>
            {children}
        </MarkerContext.Provider>
    );
}

type MarkerContentProps = {
    children?: ReactNode;
    className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
    const { marker } = useMarkerContext();

    return createPortal(
        <div className={cn("relative cursor-pointer", className)}>
            {children || <DefaultMarkerIcon />}
        </div>,
        marker.getElement(),
    );
}

function DefaultMarkerIcon() {
    return (
        <div className="default-marker-icon" />
    );
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Close popup"
            className="popup-close-button"
        >
            <X className="size-3.5" />
        </button>
    );
}

type MarkerPopupProps = {
    children: ReactNode;
    className?: string;
    closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MarkerPopup({
    children,
    className,
    closeButton = false,
    ...popupOptions
}: MarkerPopupProps) {
    const { marker, map } = useMarkerContext();
    const container = useMemo(() => document.createElement("div"), []);
    const prevPopupOptions = useRef(popupOptions);

    const popup = useMemo(() => {
        const popupInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeButton: false,
        })
            .setMaxWidth("none")
            .setDOMContent(container);

        return popupInstance;
    }, []);

    useEffect(() => {
        if (!map) return;

        popup.setDOMContent(container);
        marker.setPopup(popup);

        return () => {
            marker.setPopup(null);
        };
    }, [map]);

    if (popup.isOpen()) {
        const prev = prevPopupOptions.current;

        if (prev.offset !== popupOptions.offset) {
            popup.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            popup.setMaxWidth(popupOptions.maxWidth ?? "none");
        }

        prevPopupOptions.current = popupOptions;
    }

    const handleClose = () => popup.remove();

    return createPortal(
        <div className={cn("marker-popup-content", className)}>
            {closeButton && <PopupCloseButton onClick={handleClose} />}
            {children}
        </div>,
        container,
    );
}

type MarkerTooltipProps = {
    children: ReactNode;
    className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({
    children,
    className,
    ...popupOptions
}: MarkerTooltipProps) {
    const { marker, map } = useMarkerContext();
    const container = useMemo(() => document.createElement("div"), []);
    const prevTooltipOptions = useRef(popupOptions);

    const tooltip = useMemo(() => {
        const tooltipInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeOnClick: true,
            closeButton: false,
        }).setMaxWidth("none");

        return tooltipInstance;
    }, []);

    useEffect(() => {
        if (!map) return;

        tooltip.setDOMContent(container);

        const handleMouseEnter = () => {
            tooltip.setLngLat(marker.getLngLat()).addTo(map);
        };
        const handleMouseLeave = () => tooltip.remove();

        marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
        marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
            marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
            tooltip.remove();
        };
    }, [map]);

    if (tooltip.isOpen()) {
        const prev = prevTooltipOptions.current;

        if (prev.offset !== popupOptions.offset) {
            tooltip.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
        }

        prevTooltipOptions.current = popupOptions;
    }

    return createPortal(
        <div className={cn("marker-tooltip-content", className)}>
            {children}
        </div>,
        container,
    );
}

type MarkerLabelProps = {
    children: ReactNode;
    className?: string;
    position?: "top" | "bottom";
};

function MarkerLabel({
    children,
    className,
    position = "top",
}: MarkerLabelProps) {
    const positionClasses = {
        top: "bottom-full mb-1",
        bottom: "top-full mt-1",
    };

    return (
        <div
            className={cn(
                "marker-label",
                positionClasses[position],
                className,
            )}
        >
            {children}
        </div>
    );
}

type MapControlsProps = {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    showZoom?: boolean;
    showCompass?: boolean;
    showLocate?: boolean;
    showFullscreen?: boolean;
    className?: string;
    onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
    return <div className="control-group">{children}</div>;
}

function ControlButton({
    onClick,
    label,
    children,
    disabled = false,
}: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            type="button"
            className="control-button"
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function MapControls({
    position = "bottom-right",
    showZoom = true,
    showCompass = false,
    showLocate = false,
    showFullscreen = false,
    className,
    onLocate,
}: MapControlsProps) {
    const { map } = useMap();
    const [waitingForLocation, setWaitingForLocation] = useState(false);

    const handleZoomIn = useCallback(() => {
        map?.zoomTo(map.getZoom() + 1, { duration: 300 });
    }, [map]);

    const handleZoomOut = useCallback(() => {
        map?.zoomTo(map.getZoom() - 1, { duration: 300 });
    }, [map]);

    const handleResetBearing = useCallback(() => {
        map?.resetNorthPitch({ duration: 300 });
    }, [map]);

    const handleLocate = useCallback(() => {
        setWaitingForLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        longitude: pos.coords.longitude,
                        latitude: pos.coords.latitude,
                    };
                    map?.flyTo({
                        center: [coords.longitude, coords.latitude],
                        zoom: 14,
                        duration: 1500,
                    });
                    onLocate?.(coords);
                    setWaitingForLocation(false);
                },
                () => {
                    setWaitingForLocation(false);
                },
            );
        }
    }, [map, onLocate]);

    const handleFullscreen = useCallback(() => {
        const container = map?.getContainer();
        if (!container) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }, [map]);

    return (
        <div className={cn("map-controls", positionClasses[position], className)}>
            {showZoom && (
                <ControlGroup>
                    <ControlButton onClick={handleZoomIn} label="Zoom in">
                        <Plus className="size-4" />
                    </ControlButton>
                    <ControlButton onClick={handleZoomOut} label="Zoom out">
                        <Minus className="size-4" />
                    </ControlButton>
                </ControlGroup>
            )}
            {showCompass && (
                <ControlGroup>
                    <CompassButton onClick={handleResetBearing} />
                </ControlGroup>
            )}
            {showLocate && (
                <ControlGroup>
                    <ControlButton
                        onClick={handleLocate}
                        label="Find my location"
                        disabled={waitingForLocation}
                    >
                        {waitingForLocation ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Locate className="size-4" />
                        )}
                    </ControlButton>
                </ControlGroup>
            )}
            {showFullscreen && (
                <ControlGroup>
                    <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
                        <Maximize className="size-4" />
                    </ControlButton>
                </ControlGroup>
            )}
        </div>
    );
}

function CompassButton({ onClick }: { onClick: () => void }) {
    const { map } = useMap();
    const compassRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!map || !compassRef.current) return;

        const compass = compassRef.current;

        const updateRotation = () => {
            const bearing = map.getBearing();
            const pitch = map.getPitch();
            compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
        };

        map.on("rotate", updateRotation);
        map.on("pitch", updateRotation);
        updateRotation();

        return () => {
            map.off("rotate", updateRotation);
            map.off("pitch", updateRotation);
        };
    }, [map]);

    return (
        <ControlButton onClick={onClick} label="Reset bearing to north">
            <svg
                ref={compassRef}
                viewBox="0 0 24 24"
                className="size-5"
                style={{ transformStyle: "preserve-3d" }}
            >
                <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
                <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
                <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
                <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
            </svg>
        </ControlButton>
    );
}

type MapPopupProps = {
    longitude: number;
    latitude: number;
    onClose?: () => void;
    children: ReactNode;
    className?: string;
    closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({
    longitude,
    latitude,
    onClose,
    children,
    className,
    closeButton = false,
    ...popupOptions
}: MapPopupProps) {
    const { map } = useMap();
    const popupOptionsRef = useRef(popupOptions);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const container = useMemo(() => document.createElement("div"), []);

    const popup = useMemo(() => {
        const popupInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeButton: false,
        })
            .setMaxWidth("none")
            .setLngLat([longitude, latitude]);

        return popupInstance;
    }, []);

    useEffect(() => {
        if (!map) return;

        const onCloseProp = () => onCloseRef.current?.();

        popup.on("close", onCloseProp);

        popup.setDOMContent(container);
        popup.addTo(map);

        return () => {
            popup.off("close", onCloseProp);
            if (popup.isOpen()) {
                popup.remove();
            }
        };
    }, [map]);

    if (popup.isOpen()) {
        const prev = popupOptionsRef.current;

        if (
            popup.getLngLat().lng !== longitude ||
            popup.getLngLat().lat !== latitude
        ) {
            popup.setLngLat([longitude, latitude]);
        }

        if (prev.offset !== popupOptions.offset) {
            popup.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            popup.setMaxWidth(popupOptions.maxWidth ?? "none");
        }
        popupOptionsRef.current = popupOptions;
    }

    const handleClose = () => {
        popup.remove();
    };

    return createPortal(
        <div className={cn("map-popup", className)}>
            {closeButton && <PopupCloseButton onClick={handleClose} />}
            {children}
        </div>,
        container,
    );
}

type MapRouteProps = {
    id?: string;
    coordinates: [number, number][];
    color?: string;
    width?: number;
    opacity?: number;
    dashArray?: [number, number];
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    interactive?: boolean;
};

function MapRoute({
    id: propId,
    coordinates,
    color = "#4285F4",
    width = 3,
    opacity = 0.8,
    dashArray,
    onClick,
    onMouseEnter,
    onMouseLeave,
    interactive = true,
}: MapRouteProps) {
    const { map, isLoaded } = useMap();
    const autoId = useId();
    const id = propId ?? autoId;
    const sourceId = `route-source-${id}`;
    const layerId = `route-layer-${id}`;

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: [] },
            },
        });

        map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
                "line-color": color,
                "line-width": width,
                "line-opacity": opacity,
                ...(dashArray && { "line-dasharray": dashArray }),
            },
        });

        return () => {
            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map]);

    useEffect(() => {
        if (!isLoaded || !map || coordinates.length < 2) return;

        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        if (source) {
            source.setData({
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates },
            });
        }
    }, [isLoaded, map, coordinates, sourceId]);

    useEffect(() => {
        if (!isLoaded || !map || !map.getLayer(layerId)) return;

        map.setPaintProperty(layerId, "line-color", color);
        map.setPaintProperty(layerId, "line-width", width);
        map.setPaintProperty(layerId, "line-opacity", opacity);
        if (dashArray) {
            map.setPaintProperty(layerId, "line-dasharray", dashArray);
        }
    }, [isLoaded, map, layerId, color, width, opacity, dashArray]);

    useEffect(() => {
        if (!isLoaded || !map || !interactive) return;

        const handleClick = () => {
            onClick?.();
        };
        const handleMouseEnter = () => {
            map.getCanvas().style.cursor = "pointer";
            onMouseEnter?.();
        };
        const handleMouseLeave = () => {
            map.getCanvas().style.cursor = "";
            onMouseLeave?.();
        };

        map.on("click", layerId, handleClick);
        map.on("mouseenter", layerId, handleMouseEnter);
        map.on("mouseleave", layerId, handleMouseLeave);

        return () => {
            map.off("click", layerId, handleClick);
            map.off("mouseenter", layerId, handleMouseEnter);
            map.off("mouseleave", layerId, handleMouseLeave);
        };
    }, [
        isLoaded,
        map,
        layerId,
        onClick,
        onMouseEnter,
        onMouseLeave,
        interactive,
    ]);

    return null;
}

type MapArcDatum = {
    id: string | number;
    from: [number, number];
    to: [number, number];
};

type MapArcEvent<T extends MapArcDatum = MapArcDatum> = {
    arc: T;
    longitude: number;
    latitude: number;
    originalEvent: MapLibreGL.MapMouseEvent;
};

type MapArcLinePaint = NonNullable<MapLibreGL.LineLayerSpecification["paint"]>;
type MapArcLineLayout = NonNullable<
    MapLibreGL.LineLayerSpecification["layout"]
>;

type MapArcProps<T extends MapArcDatum = MapArcDatum> = {
    data: T[];
    id?: string;
    curvature?: number;
    samples?: number;
    paint?: MapArcLinePaint;
    layout?: MapArcLineLayout;
    hoverPaint?: MapArcLinePaint;
    onClick?: (e: MapArcEvent<T>) => void;
    onHover?: (e: MapArcEvent<T> | null) => void;
    interactive?: boolean;
    beforeId?: string;
};

const DEFAULT_ARC_CURVATURE = 0.2;
const DEFAULT_ARC_SAMPLES = 64;
const ARC_HIT_MIN_WIDTH = 12;
const ARC_HIT_PADDING = 6;

const DEFAULT_ARC_PAINT: MapArcLinePaint = {
    "line-color": "#4285F4",
    "line-width": 2,
    "line-opacity": 0.85,
};

const DEFAULT_ARC_LAYOUT: MapArcLineLayout = {
    "line-join": "round",
    "line-cap": "round",
};

function mergeArcPaint(
    paint: MapArcLinePaint,
    hoverPaint: MapArcLinePaint | undefined,
): MapArcLinePaint {
    if (!hoverPaint) return paint;
    const merged: Record<string, unknown> = { ...paint };
    for (const [key, hoverValue] of Object.entries(hoverPaint)) {
        if (hoverValue === undefined) continue;
        const baseValue = merged[key];
        merged[key] =
            baseValue === undefined
                ? hoverValue
                : [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    hoverValue,
                    baseValue,
                ];
    }
    return merged as MapArcLinePaint;
}

function buildArcCoordinates(
    from: [number, number],
    to: [number, number],
    curvature: number,
    samples: number,
): [number, number][] {
    const [x0, y0] = from;
    const [x2, y2] = to;
    const dx = x2 - x0;
    const dy = y2 - y0;
    const distance = Math.hypot(dx, dy);

    if (distance === 0 || curvature === 0) return [from, to];

    const mx = (x0 + x2) / 2;
    const my = (y0 + y2) / 2;
    const nx = -dy / distance;
    const ny = dx / distance;
    const offset = distance * curvature;
    const cx = mx + nx * offset;
    const cy = my + ny * offset;

    const points: [number, number][] = [];
    const segments = Math.max(2, Math.floor(samples));
    for (let i = 0; i <= segments; i += 1) {
        const t = i / segments;
        const inv = 1 - t;
        const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x2;
        const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y2;
        points.push([x, y]);
    }
    return points;
}

function MapArc<T extends MapArcDatum = MapArcDatum>({
    data,
    id: propId,
    curvature = DEFAULT_ARC_CURVATURE,
    samples = DEFAULT_ARC_SAMPLES,
    paint,
    layout,
    hoverPaint,
    onClick,
    onHover,
    interactive = true,
    beforeId,
}: MapArcProps<T>) {
    const { map, isLoaded } = useMap();
    const autoId = useId();
    const id = propId ?? autoId;
    const sourceId = `arc-source-${id}`;
    const layerId = `arc-layer-${id}`;
    const hitLayerId = `arc-hit-layer-${id}`;

    const mergedPaint = useMemo(
        () => mergeArcPaint({ ...DEFAULT_ARC_PAINT, ...paint }, hoverPaint),
        [paint, hoverPaint],
    );
    const mergedLayout = useMemo(
        () => ({ ...DEFAULT_ARC_LAYOUT, ...layout }),
        [layout],
    );

    const hitWidth = useMemo(() => {
        const w = paint?.["line-width"] ?? DEFAULT_ARC_PAINT["line-width"];
        const base = typeof w === "number" ? w : ARC_HIT_MIN_WIDTH;
        return Math.max(base + ARC_HIT_PADDING, ARC_HIT_MIN_WIDTH);
    }, [paint]);

    const geoJSON = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(
        () => ({
            type: "FeatureCollection",
            features: data.map((arc) => {
                const { from, to, ...properties } = arc;
                return {
                    type: "Feature",
                    properties,
                    geometry: {
                        type: "LineString",
                        coordinates: buildArcCoordinates(from, to, curvature, samples),
                    },
                };
            }),
        }),
        [data, curvature, samples],
    );

    const latestRef = useRef({ data, onClick, onHover });
    latestRef.current = { data, onClick, onHover };

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: geoJSON,
            promoteId: "id",
        });

        map.addLayer(
            {
                id: hitLayerId,
                type: "line",
                source: sourceId,
                layout: DEFAULT_ARC_LAYOUT,
                paint: {
                    "line-color": "rgba(0, 0, 0, 0)",
                    "line-width": hitWidth,
                    "line-opacity": 1,
                },
            },
            beforeId,
        );

        map.addLayer(
            {
                id: layerId,
                type: "line",
                source: sourceId,
                layout: mergedLayout,
                paint: mergedPaint,
            },
            beforeId,
        );

        return () => {
            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getLayer(hitLayerId)) map.removeLayer(hitLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map]);

    useEffect(() => {
        if (!isLoaded || !map) return;
        const source = map.getSource(sourceId) as
            | MapLibreGL.GeoJSONSource
            | undefined;
        source?.setData(geoJSON);
    }, [isLoaded, map, geoJSON, sourceId]);

    useEffect(() => {
        if (!isLoaded || !map || !map.getLayer(layerId)) return;
        for (const [key, value] of Object.entries(mergedPaint)) {
            map.setPaintProperty(
                layerId,
                key as keyof MapArcLinePaint,
                value as never,
            );
        }
        for (const [key, value] of Object.entries(mergedLayout)) {
            map.setLayoutProperty(
                layerId,
                key as keyof MapArcLineLayout,
                value as never,
            );
        }
        if (map.getLayer(hitLayerId)) {
            map.setPaintProperty(hitLayerId, "line-width", hitWidth);
        }
    }, [isLoaded, map, layerId, hitLayerId, mergedPaint, mergedLayout, hitWidth]);

    useEffect(() => {
        if (!isLoaded || !map || !interactive) return;

        let hoveredId: string | number | null = null;

        const setHover = (next: string | number | null) => {
            if (next === hoveredId) return;
            const sourceExists = !!map.getSource(sourceId);
            if (hoveredId != null && sourceExists) {
                map.setFeatureState(
                    { source: sourceId, id: hoveredId },
                    { hover: false },
                );
            }
            hoveredId = next;
            if (next != null && sourceExists) {
                map.setFeatureState({ source: sourceId, id: next }, { hover: true });
            }
        };

        const findArc = (featureId: string | number | undefined) =>
            featureId == null
                ? undefined
                : latestRef.current.data.find(
                    (arc) => String(arc.id) === String(featureId),
                );

        const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
            const featureId = e.features?.[0]?.id as string | number | undefined;
            if (featureId == null || featureId === hoveredId) return;

            setHover(featureId);
            map.getCanvas().style.cursor = "pointer";

            const arc = findArc(featureId);
            if (arc) {
                latestRef.current.onHover?.({
                    arc: arc as T,
                    longitude: e.lngLat.lng,
                    latitude: e.lngLat.lat,
                    originalEvent: e,
                });
            }
        };

        const handleMouseLeave = () => {
            setHover(null);
            map.getCanvas().style.cursor = "";
            latestRef.current.onHover?.(null);
        };

        const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
            const arc = findArc(e.features?.[0]?.id as string | number | undefined);
            if (!arc) return;
            latestRef.current.onClick?.({
                arc: arc as T,
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
                originalEvent: e,
            });
        };

        map.on("mousemove", hitLayerId, handleMouseMove);
        map.on("mouseleave", hitLayerId, handleMouseLeave);
        map.on("click", hitLayerId, handleClick);

        return () => {
            map.off("mousemove", hitLayerId, handleMouseMove);
            map.off("mouseleave", hitLayerId, handleMouseLeave);
            map.off("click", hitLayerId, handleClick);
            setHover(null);
            map.getCanvas().style.cursor = "";
        };
    }, [isLoaded, map, hitLayerId, sourceId, interactive]);

    return null;
}

type MapClusterLayerProps<
    P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
    data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
    clusterMaxZoom?: number;
    clusterRadius?: number;
    clusterColors?: [string, string, string];
    clusterThresholds?: [number, number];
    pointColor?: string;
    onPointClick?: (
        feature: GeoJSON.Feature<GeoJSON.Point, P>,
        coordinates: [number, number],
    ) => void;
    onClusterClick?: (
        clusterId: number,
        coordinates: [number, number],
        pointCount: number,
    ) => void;
};

function MapClusterLayer<
    P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
    data,
    clusterMaxZoom = 14,
    clusterRadius = 50,
    clusterColors = ["#22c55e", "#eab308", "#ef4444"],
    clusterThresholds = [100, 750],
    pointColor = "#3b82f6",
    onPointClick,
    onClusterClick,
}: MapClusterLayerProps<P>) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `cluster-source-${id}`;
    const clusterLayerId = `clusters-${id}`;
    const clusterCountLayerId = `cluster-count-${id}`;
    const unclusteredLayerId = `unclustered-point-${id}`;

    const stylePropsRef = useRef({
        clusterColors,
        clusterThresholds,
        pointColor,
    });

    useEffect(() => {
        if (!isLoaded || !map) return;

        map.addSource(sourceId, {
            type: "geojson",
            data,
            cluster: true,
            clusterMaxZoom,
            clusterRadius,
        });

        map.addLayer({
            id: clusterLayerId,
            type: "circle",
            source: sourceId,
            filter: ["has", "point_count"],
            paint: {
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    clusterColors[0],
                    clusterThresholds[0],
                    clusterColors[1],
                    clusterThresholds[1],
                    clusterColors[2],
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    clusterThresholds[0],
                    30,
                    clusterThresholds[1],
                    40,
                ],
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff",
                "circle-opacity": 0.85,
            },
        });

        map.addLayer({
            id: clusterCountLayerId,
            type: "symbol",
            source: sourceId,
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["Open Sans"],
                "text-size": 12,
            },
            paint: {
                "text-color": "#fff",
            },
        });

        map.addLayer({
            id: unclusteredLayerId,
            type: "circle",
            source: sourceId,
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": pointColor,
                "circle-radius": 5,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
            },
        });

        return () => {
            try {
                if (map.getLayer(clusterCountLayerId))
                    map.removeLayer(clusterCountLayerId);
                if (map.getLayer(unclusteredLayerId))
                    map.removeLayer(unclusteredLayerId);
                if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
    }, [isLoaded, map, sourceId]);

    useEffect(() => {
        if (!isLoaded || !map || typeof data === "string") return;

        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        if (source) {
            source.setData(data);
        }
    }, [isLoaded, map, data, sourceId]);

    useEffect(() => {
        if (!isLoaded || !map) return;

        const prev = stylePropsRef.current;
        const colorsChanged =
            prev.clusterColors !== clusterColors ||
            prev.clusterThresholds !== clusterThresholds;

        if (map.getLayer(clusterLayerId) && colorsChanged) {
            map.setPaintProperty(clusterLayerId, "circle-color", [
                "step",
                ["get", "point_count"],
                clusterColors[0],
                clusterThresholds[0],
                clusterColors[1],
                clusterThresholds[1],
                clusterColors[2],
            ]);
            map.setPaintProperty(clusterLayerId, "circle-radius", [
                "step",
                ["get", "point_count"],
                20,
                clusterThresholds[0],
                30,
                clusterThresholds[1],
                40,
            ]);
        }

        if (map.getLayer(unclusteredLayerId) && prev.pointColor !== pointColor) {
            map.setPaintProperty(unclusteredLayerId, "circle-color", pointColor);
        }

        stylePropsRef.current = { clusterColors, clusterThresholds, pointColor };
    }, [
        isLoaded,
        map,
        clusterLayerId,
        unclusteredLayerId,
        clusterColors,
        clusterThresholds,
        pointColor,
    ]);

    useEffect(() => {
        if (!isLoaded || !map) return;

        const handleClusterClick = async (
            e: MapLibreGL.MapMouseEvent & {
                features?: MapLibreGL.MapGeoJSONFeature[];
            },
        ) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: [clusterLayerId],
            });
            if (!features.length) return;

            const feature = features[0];
            const clusterId = feature.properties?.cluster_id as number;
            const pointCount = feature.properties?.point_count as number;
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
                number,
                number,
            ];

            if (onClusterClick) {
                onClusterClick(clusterId, coordinates, pointCount);
            } else {
                const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
                const zoom = await source.getClusterExpansionZoom(clusterId);
                map.easeTo({
                    center: coordinates,
                    zoom,
                });
            }
        };

        const handlePointClick = (
            e: MapLibreGL.MapMouseEvent & {
                features?: MapLibreGL.MapGeoJSONFeature[];
            },
        ) => {
            if (!onPointClick || !e.features?.length) return;

            const feature = e.features[0];
            const coordinates = (
                feature.geometry as GeoJSON.Point
            ).coordinates.slice() as [number, number];

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            onPointClick(
                feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>,
                coordinates,
            );
        };

        const handleMouseEnterCluster = () => {
            map.getCanvas().style.cursor = "pointer";
        };
        const handleMouseLeaveCluster = () => {
            map.getCanvas().style.cursor = "";
        };
        const handleMouseEnterPoint = () => {
            if (onPointClick) {
                map.getCanvas().style.cursor = "pointer";
            }
        };
        const handleMouseLeavePoint = () => {
            map.getCanvas().style.cursor = "";
        };

        map.on("click", clusterLayerId, handleClusterClick);
        map.on("click", unclusteredLayerId, handlePointClick);
        map.on("mouseenter", clusterLayerId, handleMouseEnterCluster);
        map.on("mouseleave", clusterLayerId, handleMouseLeaveCluster);
        map.on("mouseenter", unclusteredLayerId, handleMouseEnterPoint);
        map.on("mouseleave", unclusteredLayerId, handleMouseLeavePoint);

        return () => {
            map.off("click", clusterLayerId, handleClusterClick);
            map.off("click", unclusteredLayerId, handlePointClick);
            map.off("mouseenter", clusterLayerId, handleMouseEnterCluster);
            map.off("mouseleave", clusterLayerId, handleMouseLeaveCluster);
            map.off("mouseenter", unclusteredLayerId, handleMouseEnterPoint);
            map.off("mouseleave", unclusteredLayerId, handleMouseLeavePoint);
        };
    }, [
        isLoaded,
        map,
        clusterLayerId,
        unclusteredLayerId,
        sourceId,
        onClusterClick,
        onPointClick,
    ]);

    return null;
}

type LocationProperties = {
    id: number;
    name: string;
    category: string;
    color: string;
    address: string;
    tel: string;
    url: string;
    img: string;
};


type SelectedPoint = LocationProperties & {
    coordinates: [number, number];
};

const pointsData: GeoJSON.FeatureCollection<GeoJSON.Point, LocationProperties> = {
    type: "FeatureCollection",
    features: [
                {
            type: "Tienda de ropa",
            geometry: { type: "Point", coordinates: [ -64.18268788804977,-31.420670990078232] },
            properties: {
                id: 1,
                name: "Bomba Mayorista Textil",
                category: "Tienda de ropa",
                color: tiendaDeRopa,
                address: "11 de Septiembre 2720 Pasaje Sivori 345 San Martin 347 peatonal, X5001 Córdoba",
                tel: "0351 688-9718",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Mercado mayorista de ropa",
            geometry: { type: "Point", coordinates: [ -64.18158592188651,-31.41869392938558] },
            properties: {
                id: 2,
                name: "KIKA MAYORISTA",
                category: "Mercado mayorista de ropa",
                color: mercadoMayoristaDeRopa,
                address: "Ituzaingó 169 X5000, X5000 Córdoba",
                tel: "0351 15-801-7401",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tejeduría",
            geometry: { type: "Point", coordinates: [-64.514429, -31.4210524] },
            properties: {
                id: 3,
                name: "Mariana Tejidos",
                category: "Tejeduría",
                color: tejedura,
                address: "Alejandro Magno, Los Sauces y, X5152 Villa Carlos Paz, Córdoba",
                tel: "03541 57-3657",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Fábrica",
            geometry: { type: "Point", coordinates: [-64.5153424, -31.3734834] },
            properties: {
                id: 4,
                name: "As Textil",
                category: "Fábrica",
                color: fbrica,
                address: "Av. los Olmos, X5152 Santa Cruz del Lago, Córdoba",
                tel: "03541 66-4765",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Mayorista textil",
            geometry: { type: "Point", coordinates: [ -64.20210380976503, -31.387603815108886] },
            properties: {
                id: 5,
                name: "Algodonera Paso Viejo - Remeras, Chombas, Buzos, Musculosas, Articulos Textiles para Estampar",
                category: "Mayorista textil",
                color: mayoristaTextil,
                address: "Gral. Tomás Guido 1851, X5008 Córdoba",
                tel: "0351 648-2765",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Fábrica",
            geometry: { type: "Point", coordinates: [ -64.16132267358107,-31.274448028153696] },
            properties: {
                id: 7,
                name: "(LB) fabrica textil de corte",
                category: "Fábrica",
                color: fbrica,
                address: "Esteban Echeverría 520, X5145 Juárez Celman, Córdoba",
                tel: "0351 657-7821",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Fábrica",
            geometry: { type: "Point", coordinates: [ -64.25195420918006,-31.309911445792935] },
            properties: {
                id: 8,
                name: "Figrotex confección textil",
                category: "Fábrica",
                color: fbrica,
                address: "X5000 Córdoba",
                tel: "0351 812-5840",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Fábrica",
            geometry: { type: "Point", coordinates: [-64.26200642372443,-31.331731719921812] },
            properties: {
                id: 9,
                name: "Craft textil",
                category: "Fábrica",
                color: fbrica,
                address: "Juan Manuel Fangio 7783, X5022 Córdoba",
                tel: "0351 515-9045",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Fábrica",
            geometry: { type: "Point", coordinates: [-64.34481621959584,-31.36094917043367] },
            properties: {
                id: 10,
                name: "Tu Fabrica Textil POD",
                category: "Fábrica",
                color: fbrica,
                address: "Maria Elena Walsh 808, X5151 La Calera, Córdoba",
                tel: "0351 533-2629",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro de reciclaje",
            geometry: { type: "Point", coordinates: [-64.10875409397589,-31.37905556697481] },
            properties: {
                id: 11,
                name: "Desarrollos Sostenibles SRL (Reciclar Plastico)",
                category: "Centro de reciclaje",
                color: centroDeReciclaje,
                address: "2716, C. las Quintas, Córdoba",
                tel: "0351 496-2661",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro comunitario",
            geometry: { type: "Point", coordinates: [ -64.11934786720413,-31.437800079270392] },
            properties: {
                id: 12,
                name: "Centro Verde Este - COYS",
                category: "Centro comunitario",
                color: centroComunitario,
                address: "X5006 Córdoba",
                tel: "",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro de reciclaje",
            geometry: { type: "Point", coordinates: [-64.19931434010837,-31.46812897902271] },
            properties: {
                id: 13,
                name: "Centro Verde SUR",
                category: "Centro de reciclaje",
                color: centroDeReciclaje,
                address: "Av. Concejal Felipe Belardinelli 4776, X5016 Córdoba",
                tel: "0351 494-8960",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro de reciclaje",
            geometry: { type: "Point", coordinates: [ -64.21382557894704 ,-31.3434245367355] },
            properties: {
                id: 14,
                name: "Centro Verde Norte",
                category: "Centro de reciclaje",
                color: centroDeReciclaje,
                address: "Blvd. de los Alemanes 3387, X5147 Córdoba",
                tel: "",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro de reciclaje",
            geometry: { type: "Point", coordinates: [-64.1610937, -31.3875466] },
            properties: {
                id: 15,
                name: "Ecofem",
                category: "Centro de reciclaje",
                color: centroDeReciclaje,
                address: "Av. Leandro N. Alem, X5012 Córdoba",
                tel: "",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro de reciclaje",
            geometry: { type: "Point", coordinates: [ -64.24399562138287,-31.3866128786279] },
            properties: {
                id: 16,
                name: "Cooperativa La VICTORIA",
                category: "Centro de reciclaje",
                color: cooperativaLaVictoria,
                address: "Unnamed Road, Córdoba",
                tel: "0351 313-0229",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Almacén",
            geometry: { type: "Point", coordinates: [-64.2243691, -31.4674678] },
            properties: {
                id: 17,
                name: "CENTRO VERDE TELAS - COYS",
                category: "Almacén",
                color: almacn,
                address: "X5017 Córdoba",
                tel: "",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1845687, -31.4138792] },
            properties: {
                id: 18,
                name: "Tienda Los Angeles",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Rivera Indarte 160, X5000 Córdoba",
                tel: "0351 422-2889",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.2255454, -31.4051969] },
            properties: {
                id: 19,
                name: "Retanil",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Caseros 3292, X5002AEH Córdoba",
                tel: "0351 480-8984",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.21779396483404,-31.43074743726737] },
            properties: {
                id: 20,
                name: "Indultex",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Av. Fuerza Aérea Argentina 2195, X5010 Córdoba",
                tel: "0351 466-1093",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.185399, -31.416018] },
            properties: {
                id: 21,
                name: "Textil Trejo",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Obispo Trejo 41, X5000 IYA, Córdoba",
                tel: "0351 15-594-2301",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Mayorista textil",
            geometry: { type: "Point", coordinates: [-64.22039387405398,-31.401887374537253] },
            properties: {
                id: 22,
                name: "Brufman Textil",
                category: "Mayorista textil",
                color: mayoristaTextil,
                address: "Alberdi, Av. Colón 3048, X5000EQO Córdoba",
                tel: "0351 521-6329",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.181782, -31.4108426] },
            properties: {
                id: 23,
                name: "Grandes Tiendas Florencia",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Ituzaingo 230 Ambrosio Olmos 36, San Martín 472, X5000 Córdoba",
                tel: "0351 307-4321",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [ -31.41222789226023, -64.18037046277259] },
            properties: {
                id: 24,
                name: "Tapicordoba",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Rivadavia 360, X5000 Córdoba",
                tel: "0351 15-359-0473",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Modista",
            geometry: { type: "Point", coordinates: [-64.2156357520215,-31.409540377505728,] },
            properties: {
                id: 25,
                name: "Que Chuchi",
                category: "Modista",
                color: modista,
                address: "Duarte Quirós 2441, X5000 Córdoba",
                tel: "0351 851-2938",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1767579, -31.4058155] },
            properties: {
                id: 27,
                name: "Textiles del Suquía | Never S.R.L.",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Pasaje Agustín Pérez 2 X5000GJA CP:, X5000FOB Córdoba",
                tel: "0351 15-731-4443",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1815718, -31.4175382] },
            properties: {
                id: 28,
                name: "Ch Tiendas Chamme",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Ituzaingó 63, X5000 IJA, Córdoba",
                tel: "0351 423-4932",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1856872, -31.415794] },
            properties: {
                id: 29,
                name: "Sederia La Victoria",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Rivera Indarte 15, X5000JAA Córdoba",
                tel: "0351 217-7952",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.2200451, -31.4310425] },
            properties: {
                id: 30,
                name: "Colores y Texturas",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Av. Fuerza Aérea Argentina 2417, X5010 Córdoba",
                tel: "0351 719-0312",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1759638, -31.3975637] },
            properties: {
                id: 31,
                name: "Ames Textil",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Av. Juan B Justo 2397 BºALTA, X5001GXB Córdoba",
                tel: "0351 471-0624",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1819526, -31.4164433] },
            properties: {
                id: 32,
                name: "MODA TEXTIL",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Rosario de Sta. Fe 157, X5000ACC Córdoba",
                tel: "0351 624-8020",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de deportes",
            geometry: { type: "Point", coordinates: [-64.2084962, -31.41207] },
            properties: {
                id: 33,
                name: "Carjox Ropa Deportiva",
                category: "Tienda de deportes",
                color: tiendaDeDeportes,
                address: "Duarte Quirós 1717, X5003 Córdoba",
                tel: "0351 815-6162",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de ropa",
            geometry: { type: "Point", coordinates: [-64.1941686, -31.4109128] },
            properties: {
                id: 34,
                name: "María Pal",
                category: "Tienda de ropa",
                color: tiendaDeRopa,
                address: "X5000KPC Córdoba AR, Justo José de Urquiza 163, X5000 KPC",
                tel: "0351 441-4024",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.2002089, -31.4498703] },
            properties: {
                id: 35,
                name: "Entre Telas Las Flores",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Av. Vélez Sarsfield 3458, X5000 Córdoba",
                tel: "0351 15-358-9622",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1851434, -31.4157492] },
            properties: {
                id: 36,
                name: "Galia",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Deán Funes 85 5000, X5000AAB Córdoba",
                tel: "0351 421-5989",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1825996, -31.4140443] },
            properties: {
                id: 37,
                name: "Grandes tiendas Florencia",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Av. Emilio Olmos 36, X5022 Córdoba",
                tel: "0351 661-2435",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1798132, -31.421229] },
            properties: {
                id: 38,
                name: "Texcor Telas",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Corrientes 424, X5000 Córdoba",
                tel: "0351 371-4856",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.205447, -31.3701471] },
            properties: {
                id: 39,
                name: "Que tul telas",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Av. Monseñor Pablo Cabrera 3960, X5008HIR Córdoba",
                tel: "0351 390-7278",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de cortinas",
            geometry: { type: "Point", coordinates: [-64.2019003, -31.4134278] },
            properties: {
                id: 40,
                name: "Barroco Deco",
                category: "Tienda de cortinas",
                color: tiendaDeCortinas,
                address: "Caseros 1244, X5000 Córdoba",
                tel: "0351 325-8602",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Comercio",
            geometry: { type: "Point", coordinates: [-64.1817619, -31.418373] },
            properties: {
                id: 41,
                name: "Imperio Textil Mayorista",
                category: "Comercio",
                color: comercio,
                address: "Ituzaingó 129, X5000IJC Córdoba",
                tel: "0351 424-5329",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1810692, -31.4127739] },
            properties: {
                id: 42,
                name: "Todo Poliester",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Rivadavia 322, X5000IPH Córdoba",
                tel: "0351 627-1738",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Mayorista textil",
            geometry: { type: "Point", coordinates: [-64.17962846127053, -31.422073693997763,] },
            properties: {
                id: 43,
                name: "La General SA",
                category: "Mayorista textil",
                color: mayoristaTextil,
                address: "Boulevard Dr. Arturo H. Illia 431, Centro, X5000ASE Córdoba",
                tel: "0351 521-6335",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.2033057, -31.378876] },
            properties: {
                id: 44,
                name: "Tía María Retaceria",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Los Granaderos 2218, Zumarán, Bv. Los Granaderos 2208, X5008ETX Córdoba",
                tel: "0351 15-264-3478",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Centro comercial",
            geometry: { type: "Point", coordinates: [-64.1809907, -31.4122391] },
            properties: {
                id: 45,
                name: "Tapicenter",
                category: "Centro comercial",
                color: centroComercial,
                address: "Rivadavia 369, X5021KEG Córdoba",
                tel: "0351 428-1402",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1485162, -31.422758] },
            properties: {
                id: 46,
                name: "Telas",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "San Jerónimo 2753, X5006IKC Córdoba",
                tel: "0351 15-593-7538",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1829524, -31.4199489] },
            properties: {
                id: 47,
                name: "Todo Tela",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "X5000 Córdoba",
                tel: "0383 420-2924",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de cortinas",
            geometry: { type: "Point", coordinates: [-64.1822771, -31.4114542] },
            properties: {
                id: 48,
                name: "Cortinería La Union Textil",
                category: "Tienda de cortinas",
                color: tiendaDeCortinas,
                address: "La Rioja 15, X5022 Córdoba",
                tel: "0351 423-7868",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },
        {
            type: "Tienda de telas",
            geometry: { type: "Point", coordinates: [-64.1817399, -31.418066] },
            properties: {
                id: 49,
                name: "Telas Shop",
                category: "Tienda de telas",
                color: tiendaDeTelas,
                address: "Ituzaingó 107, X5000AGF Córdoba",
                tel: "0351 245-8598",
                url: "",
                img: "https://maps.google.com/maps/api/staticmap?center=-32.2115978%2C-64.5928352&zoom=8&size=900x900&language=en&sensor=false&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0&signature=KLsudCDUStTVCrWXxRAsHYGMsXQ",
            },
        },

    ],
};



function LayerMarkers() {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = "markers-source-" + id;
    const layerId = "markers-layer-" + id;
    const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);

    useEffect(() => {
        if (!map || !isLoaded) return;
        map.addSource(sourceId, { type: "geojson", data: pointsData });
        map.addLayer({
            id: layerId,
            type: "circle",
            source: sourceId,
            paint: {
                "circle-radius": 8,
                "circle-color": ["get", "color"],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
            },
        });

        const handleClick = (
            e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] },
        ) => {
            if (!e.features?.length) return;
            const feature = e.features[0];
            const coords = (feature.geometry as GeoJSON.Point).coordinates as [
                number,
                number,
            ];
            const properties = feature.properties as LocationProperties;
            setSelectedPoint({
                ...properties,
                coordinates: coords,
            });
        };

        const handleMouseEnter = () => {
            map.getCanvas().style.cursor = "pointer";
        };

        const handleMouseLeave = () => {
            map.getCanvas().style.cursor = "";
        };

        map.on("click", layerId, handleClick);
        map.on("mouseenter", layerId, handleMouseEnter);
        map.on("mouseleave", layerId, handleMouseLeave);

        return () => {
            map.off("click", layerId, handleClick);
            map.off("mouseenter", layerId, handleMouseEnter);
            map.off("mouseleave", layerId, handleMouseLeave);
            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch { }
        };
    }, [map, isLoaded, sourceId, layerId]);

    return (
        <>
            {selectedPoint && (
                <MapPopup
                    longitude={selectedPoint.coordinates[0]}
                    latitude={selectedPoint.coordinates[1]}
                    onClose={() => setSelectedPoint(null)}
                    closeOnClick={false}
                    focusAfterOpen={false}
                    offset={10}
                    closeButton
                >
                    <div className="map-popup-card">
                        <p className="map-popup-title">{selectedPoint.name}</p>
                        <p className="map-popup-description">{selectedPoint.category}</p>
                        <p className="map-popup-description">{selectedPoint.address}</p>
                        <p className="map-popup-description">Tel: {selectedPoint.tel}</p>
                        {selectedPoint.img && (
                            <img
                                src={selectedPoint.img}
                                alt={selectedPoint.name}
                                className="map-popup-image"
                            />
                        )}
                    </div>
                </MapPopup>
            )}
        </>
    );
}

function LayerMarkersDemo() {
    return (
        <div className="layer-markers-demo">
            <a href="/lugares_convertidos.csv" download="map-r-textil.csv">Download</a>
            <div className="demo-map-shell">
                <Map center={[-64.19752461958734, -31.420231316685317]} zoom={10}>
                    <LayerMarkers />
                </Map>
            </div>
        </div>
    );
}

export {
    LayerMarkers,
    Map,
    useMap,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
    MarkerLabel,
    MapPopup,
    MapControls,
    MapRoute,
    MapArc,
    MapClusterLayer,
    LayerMarkersDemo,
};

export type { MapRef, MapViewport, MapArcDatum, MapArcEvent };
