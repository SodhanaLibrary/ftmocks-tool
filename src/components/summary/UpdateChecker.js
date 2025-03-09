import { useState, useEffect } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";

export default function UpdateChecker() {
    const [versions, setVersions] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetch("/api/v1/versions")
            .then((res) => res.json())
            .then((data) => setVersions(data))
            .catch((err) => console.error("Error fetching versions:", err));
    }, []);

    const handleUpdate = () => {
        setUpdating(true);
        fetch("/api/v1/versions", { method: "PUT" })
            .then((res) => res.json())
            .then(() => {
                alert("Update successful!");
                setUpdating(false);
                window.location.reload(); // Refresh to reflect updates
            })
            .catch((err) => {
                console.error("Update failed:", err);
                alert("Update failed. Check console for details.");
                setUpdating(false);
            });
    };

    if (!versions || versions.localVersion === versions.remoteVersion) return null;

    return (
        <Card sx={{ width: '100%', mx: "auto", mb: 2, p: 2, textAlign: "center" }}>
            <CardContent>
                <Typography variant="h6" color="warning.main">
                    New version available!
                </Typography>
                <Typography variant="body2" sx={{ my: 1 }}>
                    Local: {versions.localVersion} | Remote: {versions.remoteVersion}
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleUpdate} 
                    disabled={updating}
                >
                    {updating ? "Updating..." : "Update Now"}
                </Button>
            </CardContent>
        </Card>
    );
}
