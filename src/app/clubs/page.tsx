"use client";
import { useState } from "react";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";



const disciplines = ["Pistol", "Rifle", "Shotgun", "Airgun"];

export default function ClubsPage() {

    const [search, setSearch] = useState("");
    const [postcode, setPostcode] = useState("");
    const [distance, setDistance] = useState("25"); // default 25 miles
    const [discipline, setDiscipline] = useState("");
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch clubs from API
    const fetchClubs = async (params?: { name?: string; postcode?: string; discipline?: string; distance?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL("/api/clubs", window.location.origin);
            if (params?.name) url.searchParams.set("name", params.name);
            if (params?.postcode) url.searchParams.set("postcode", params.postcode);
            if (params?.discipline) url.searchParams.set("discipline", params.discipline);
            if (params?.distance) url.searchParams.set("distance", params.distance);
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed to fetch clubs");
            const data = await res.json();
            setClubs(data);
        } catch (e: any) {
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchClubs();
    }, []);

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    fetchClubs({ name: search, postcode, discipline, distance });
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 font-headline">Find a Shooting Club</h1>
            <form
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8"
                onSubmit={handleSubmit}
            >
                <div>
                    <Label htmlFor="search">Club Name</Label>
                    <Input
                        id="search"
                        placeholder="e.g. Oakridge Shooters"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="discipline">Discipline</Label>
                    <Select value={discipline} onValueChange={setDiscipline}>
                        <SelectTrigger id="discipline" className="mt-1">
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="*">Any</SelectItem>
                            {disciplines.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="postcode">Distance From (Postcode)</Label>
                    <Input
                        id="postcode"
                        placeholder="e.g. SW1A 1AA"
                        value={postcode}
                        onChange={e => setPostcode(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="distance">Distance</Label>
                    <Select value={distance} onValueChange={setDistance}>
                        <SelectTrigger id="distance" className="mt-1">
                            <SelectValue placeholder="25 miles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 miles</SelectItem>
                            <SelectItem value="25">25 miles</SelectItem>
                            <SelectItem value="50">50 miles</SelectItem>
                            <SelectItem value="100">100 miles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Search</Button>
                </div>
            </form>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading && (
                    <div className="col-span-full text-center text-muted-foreground">Loading clubs…</div>
                )}
                {error && (
                    <div className="col-span-full text-center text-destructive">{error}</div>
                )}
                {!loading && !error && clubs.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">No clubs found. Try adjusting your search.</div>
                )}
                {clubs.map(club => (
                    <Card key={club._id || club.id} className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>{club.name}</span>
                                <a
                                    href={`/clubs/${encodeURIComponent(club.name)}`}
                                    className="ml-2 text-xs px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20 font-medium"
                                    style={{ lineHeight: '1.2', display: 'inline-block' }}
                                    aria-label={`View more about ${club.name}`}
                                >
                                    View
                                </a>
                                {club.tags?.map((tag: string) => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1">
                            <div className="text-muted-foreground mb-2">
                                {club.address && typeof club.address === 'object'
                                    ? [club.address.address, club.address.city, club.address.postcode, club.address.country].filter(Boolean).join(', ')
                                    : club.address}
                            </div>
                            <div className="mb-2">{club.description}</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {club.disciplines?.map((d: string) => (
                                    <Badge key={d}>{d}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}