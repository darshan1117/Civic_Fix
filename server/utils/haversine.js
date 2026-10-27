const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates Great-Circle distance between two coordinates in meters.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Finds duplicates within specified radius (default 50 meters)
 */
export function findDuplicateIssues(newReport, existingIssues, radiusMeters = 50) {
  const matches = [];

  for (const issue of existingIssues) {
    if (String(issue.category_id) !== String(newReport.categoryId)) continue;
    if (issue.status === 'Closed' || issue.status === 'Rejected') continue;

    const distance = calculateHaversineDistance(
      newReport.lat,
      newReport.lng,
      issue.lat,
      issue.lng
    );

    if (distance <= radiusMeters) {
      const firstPhoto = issue.photos && issue.photos.length > 0 ? issue.photos[0].url : null;
      matches.push({
        id: issue._id || issue.id,
        public_id: issue.public_id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        lat: issue.lat,
        lng: issue.lng,
        address_text: issue.address_text,
        distance_meters: Math.round(distance * 10) / 10,
        upvote_count: issue.upvote_count || 0,
        created_at: issue.created_at || issue.createdAt,
        first_photo_url: firstPhoto,
      });
    }
  }

  return matches.sort((a, b) => a.distance_meters - b.distance_meters);
}
