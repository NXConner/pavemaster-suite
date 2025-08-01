export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-6 w-full max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">PaveMaster Suite</h1>
          <p className="text-xl text-muted-foreground">
            Professional asphalt paving and sealing management system
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Projects</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage your paving projects</p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
              View Projects
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Equipment</h3>
            <p className="text-sm text-muted-foreground mb-4">Track equipment and fleet</p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Manage Equipment
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Business insights and reports</p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}