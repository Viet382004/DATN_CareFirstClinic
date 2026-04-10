namespace CareFirstClinic.API.Common
{
    public abstract class BaseQueryParams
    {
        private int _page = 1;
        public int Page
        {
            get => _page;
            set => _page = value < 1 ? 1 : value;
        }

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : value > 50 ? 50 : value;
        }

        public string? SortBy { get; set; } = "createdAt";

        public string? Search { get; set; }

        private string _sortDir = "desc";
        public string SortDir
        {
            get => _sortDir;
            set => _sortDir = value?.ToLower() == "asc" ? "asc" : "desc";
        }

        public bool IsAscending => SortDir == "asc";
    }
}
