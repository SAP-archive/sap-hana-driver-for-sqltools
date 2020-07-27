const conventionalRecommendedBump = require(`conventional-recommended-bump`);

conventionalRecommendedBump({
    preset: `angular`
}, (error, recommendation) => {
    console.log(recommendation.releaseType); // 'major'
})